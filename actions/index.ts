"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/send-mail";
import { confirmEmailTemplate, passwordResetTemplate, orderReceivedTemplate, enrolmentConfirmedTemplate, orderStatusChangedTemplate, broadcastTemplate, cohortStartingTemplate, cohortEndingSoonTemplate } from "@/lib/emails/templates";
import { registerSchema, contactSchema, loginSchema, type RegisterInput, type ContactInput, type LoginInput } from "@/lib/validations/auth";
import { checkoutDetailsSchema, type CheckoutDetailsInput } from "@/lib/validations/checkout";
import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "@/lib/cloudinary";
import { generateOrderNumber, generatePaymentReference } from "@/lib/references";
import { initializePaystackTransaction, verifyPaystackTransaction } from "@/lib/paystack";
import { logAction } from "@/lib/logger";
import { AdminPermissionType } from "@prisma/client";
import { requirePermission, requireSuperAdmin, UnauthorizedError } from "@/lib/rbac";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const EMAIL_VERIFY_TTL_HOURS = 24;

/**
 * Registers a new local-provider account. Account starts in `Pending`
 * status and stays unusable for login until the user clicks the
 * confirmation link we email them — per the brief, only Google sign-ins
 * skip this step.
 */
export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  const { firstname, lastname, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: "Already registered" },
    };
  }

  const hashed = await bcrypt.hash(password, 12);
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      firstname,
      lastname,
      email,
      phone,
      password: hashed,
      provider: "local",
      status: "Pending",
      emailVerifyToken: token,
      emailVerifyExpires: expires,
      roles: { create: { role: "Customer" } },
      cart: { create: {} },
      notificationPref: { create: {} },
    },
  });

  await sendMail({
    to: user.email,
    subject: "Confirm your Yarniebeauty account",
    html: confirmEmailTemplate(user.firstname, token),
    kind: "transactional",
  });

  return { ok: true };
}

/**
 * Resends a fresh confirmation link — used if the original expired or the
 * user lost the email. Always returns ok:true even if the email doesn't
 * exist or is already verified, so this endpoint can't be used to probe
 * which emails are registered.
 */
export async function resendConfirmationEmail(email: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || user.status !== "Pending" || user.provider !== "local") {
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: token, emailVerifyExpires: expires },
  });

  await sendMail({
    to: user.email,
    subject: "Confirm your Yarniebeauty account",
    html: confirmEmailTemplate(user.firstname, token),
    kind: "transactional",
  });

  return { ok: true };
}

/** Activates an account once the user clicks the emailed confirmation link. */
export async function confirmEmail(token: string): Promise<ActionResult> {
  if (!token) return { ok: false, error: "Missing confirmation token." };

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    return { ok: false, error: "This confirmation link is invalid." };
  }

  if (!user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
    return {
      ok: false,
      error: "This confirmation link has expired. Request a new one from the login page.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: "Active",
      emailVerifiedAt: new Date(),
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return { ok: true };
}

/** Public contact form submission. */
export async function submitContactForm(input: ContactInput): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  await prisma.contact.create({ data: parsed.data });
  return { ok: true };
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

const RESET_TTL_MINUTES = 60;

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  // Always return ok:true regardless of whether the account exists or uses
  // Google sign-in, so this endpoint can't be used to probe registered emails.
  if (!user || user.provider !== "local") {
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetExpires: expires },
  });

  await sendMail({
    to: user.email,
    subject: "Reset your Yarniebeauty password",
    html: passwordResetTemplate(user.firstname, token),
    kind: "transactional",
  });

  return { ok: true };
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  if (!token) return { ok: false, error: "Missing reset token." };
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user) return { ok: false, error: "This reset link is invalid." };
  if (!user.resetExpires || user.resetExpires < new Date()) {
    return { ok: false, error: "This reset link has expired. Request a new one." };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetExpires: null },
  });

  return { ok: true };
}

// ============================================================================
// PUBLIC DATA — products, categories, cohorts (read-only, no auth required)
// ============================================================================

export async function getFeaturedProducts(limit = 6) {
  return prisma.product.findMany({
    where: { status: "Available" },
    orderBy: [{ popular: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function getAllProducts(opts?: { categorySlug?: string; search?: string }) {
  return prisma.product.findMany({
    where: {
      status: "Available",
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.search
        ? { name: { contains: opts.search } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { status: "Available" },
    orderBy: { name: "asc" },
  });
}

export async function getOpenCohorts() {
  return prisma.cohort.findMany({
    where: { status: { in: ["Upcoming", "Ongoing"] } },
    orderBy: { startDate: "asc" },
    include: { _count: { select: { enrolments: true } } },
  });
}

export async function getCohortBySlug(slug: string) {
  return prisma.cohort.findUnique({
    where: { slug },
    include: { _count: { select: { enrolments: true } } },
  });
}

/**
 * Credentials login. Returns a typed result instead of throwing so the
 * login form can render specific guidance (e.g. "confirm your email")
 * rather than a generic error.
 */
export async function loginWithCredentials(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.cause?.err?.message === "EMAIL_NOT_CONFIRMED") {
        return {
          ok: false,
          error: "Please confirm your email before logging in. Check your inbox, or request a new link.",
        };
      }
      if (err.cause?.err?.message === "ACCOUNT_SUSPENDED") {
        return { ok: false, error: "This account has been suspended. Contact support for help." };
      }
      return { ok: false, error: "Incorrect email or password." };
    }
    throw err;
  }
}

// ============================================================================
// ADMIN — session & permission resolution
// ============================================================================

export async function getAdminContext() {
  const session = await auth();
  if (!session?.user) return null;

  const roles = session.user.roles ?? [];
  const isSuperAdmin = roles.includes("SuperAdmin");
  const isAdmin = roles.includes("Admin");

  if (!isSuperAdmin && !isAdmin) return null;

  const grants = isSuperAdmin
    ? Object.values(AdminPermissionType)
    : (
        await prisma.adminPermission.findMany({
          where: { userId: session.user.id },
          select: { type: true },
        })
      ).map((g) => g.type);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return {
    userId: session.user.id,
    name: user ? `${user.firstname} ${user.lastname}` : "",
    isSuperAdmin,
    isAdmin,
    permissions: new Set(grants),
  };
}

// ============================================================================
// ADMIN — PRODUCTS
// ============================================================================

const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  categoryId: z.string().min(1, "Choose a category"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  qtyAvailable: z.coerce.number().int().min(0),
  popular: z.boolean().optional(),
  description: z.string().trim().max(5000).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    crypto.randomBytes(3).toString("hex")
  );
}

export async function getAdminProducts() {
  await requirePermission("MANAGE_PRODUCTS");
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true, category: true },
  });
}

export async function getAdminProductById(id: string) {
  await requirePermission("MANAGE_PRODUCTS");
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function createProduct(
  input: ProductInput,
  imageDataUrls: string[]
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const uploaded = await Promise.all(
    imageDataUrls.map((url) => uploadImageToCloudinary(url, "products"))
  );

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      categoryId: parsed.data.categoryId,
      price: parsed.data.price,
      qtyAvailable: parsed.data.qtyAvailable,
      popular: parsed.data.popular ?? false,
      description: parsed.data.description,
      status: "Unavailable",
      creatorId: session.user.id,
      images: {
        create: uploaded.map((img, i) => ({
          secureUrl: img.secureUrl,
          publicId: img.publicId,
          isPrimary: i === 0,
          position: i,
        })),
      },
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "CREATE",
    table: "YnProduct",
    message: `Created product "${product.name}" (${product.id}).`,
  });

  revalidatePath("/admin/products");
  return { ok: true, data: { id: product.id } };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  newImageDataUrls: string[]
): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!existing) return { ok: false, error: "Product not found." };

  const uploaded = await Promise.all(
    newImageDataUrls.map((url) => uploadImageToCloudinary(url, "products"))
  );

  await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      categoryId: parsed.data.categoryId,
      price: parsed.data.price,
      qtyAvailable: parsed.data.qtyAvailable,
      popular: parsed.data.popular ?? false,
      description: parsed.data.description,
      images: uploaded.length
        ? {
            create: uploaded.map((img, i) => ({
              secureUrl: img.secureUrl,
              publicId: img.publicId,
              isPrimary: existing.images.length === 0 && i === 0,
              position: existing.images.length + i,
            })),
          }
        : undefined,
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "UPDATE",
    table: "YnProduct",
    message: `Updated product "${parsed.data.name}" (${id}).`,
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}

export async function deleteProductImage(imageId: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return { ok: false, error: "Image not found." };

  await deleteImageFromCloudinary(image.publicId).catch(() => {});
  await prisma.productImage.delete({ where: { id: imageId } });

  await logAction({
    actorId: session.user.id,
    action: "DELETE",
    table: "YnProductImage",
    message: `Deleted image ${imageId} from product ${image.productId}.`,
  });

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<ActionResult> {
  await requirePermission("MANAGE_PRODUCTS");

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProductAvailability(id: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { ok: false, error: "Product not found." };

  const nextStatus = product.status === "Available" ? "Unavailable" : "Available";
  await prisma.product.update({ where: { id }, data: { status: nextStatus } });

  await logAction({
    actorId: session.user.id,
    action: "STATUS_CHANGE",
    table: "YnProduct",
    message: `Set "${product.name}" to ${nextStatus}.`,
  });

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) return { ok: false, error: "Product not found." };

  await Promise.all(product.images.map((img) => deleteImageFromCloudinary(img.publicId).catch(() => {})));
  await prisma.product.delete({ where: { id } });

  await logAction({
    actorId: session.user.id,
    action: "DELETE",
    table: "YnProduct",
    message: `Deleted product "${product.name}" (${id}).`,
  });

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function getAdminCategories() {
  await requirePermission("MANAGE_PRODUCTS");
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("MANAGE_PRODUCTS");

  const trimmed = name.trim();
  if (trimmed.length < 2) return { ok: false, error: "Category name is too short." };

  const category = await prisma.category.create({
    data: { name: trimmed, slug: slugify(trimmed) },
  });

  await logAction({
    actorId: session.user.id,
    action: "CREATE",
    table: "YnCategory",
    message: `Created category "${trimmed}".`,
  });

  revalidatePath("/admin/products");
  return { ok: true, data: { id: category.id } };
}

// ============================================================================
// ADMIN — ORDERS
// ============================================================================

export async function getAdminOrders() {
  await requirePermission("MANAGE_ORDERS");
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, user: true },
  });
}

export async function getAdminOrderById(id: string) {
  await requirePermission("MANAGE_ORDERS");
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: true } } } },
      payment: true,
      user: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

const ORDER_STATUS_FLOW: Record<string, string> = {
  Pending: "Confirmed",
  Confirmed: "Processing",
  Processing: "OutForDelivery",
  OutForDelivery: "Delivered",
};

/**
 * Updates an order's status. The confirmation step happens in the UI
 * (AntDesign Modal.confirm) before this is ever called — this action is
 * the actual mutation + side effects: audit log entry, status history
 * row, and an email to the customer with the new status.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: "Pending" | "Confirmed" | "Processing" | "OutForDelivery" | "Delivered" | "Returned" | "Cancelled",
  note?: string
): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_ORDERS");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Order not found." };

  const previousStatus = order.status;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      updatedById: session.user.id,
      statusHistory: {
        create: { status: newStatus, note, changedBy: session.user.id },
      },
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "STATUS_CHANGE",
    table: "YnOrder",
    message: `Order ${order.orderNumber} status changed: ${previousStatus} → ${newStatus}.${note ? ` Note: ${note}` : ""}`,
  });

  await sendMail({
    to: order.email,
    subject: `Order ${order.orderNumber} — ${newStatus}`,
    html: orderStatusChangedTemplate({
      firstname: order.fullname.split(" ")[0],
      orderNumber: order.orderNumber,
      status: newStatus,
      note,
    }),
    kind: "order",
    userId: order.userId,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  return { ok: true };
}

export async function getNextOrderStatus(current: string): Promise<string | null> {
  return ORDER_STATUS_FLOW[current] ?? null;
}

// ============================================================================
// ADMIN — ACADEMY (COHORTS)
// ============================================================================

const cohortSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().positive("Price must be greater than 0"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  duration: z.string().trim().min(1).max(50),
  modePolicy: z.enum(["PhysicalOnly", "OnlineOnly", "StudentChoice"]),
  capacity: z.coerce.number().int().positive().optional().nullable(),
});
export type CohortInput = z.infer<typeof cohortSchema>;

export async function getAdminCohorts() {
  await requirePermission("MANAGE_COHORTS");
  return prisma.cohort.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { enrolments: true } } },
  });
}

export async function getAdminCohortById(id: string) {
  await requirePermission("MANAGE_COHORTS");
  return prisma.cohort.findUnique({
    where: { id },
    include: {
      enrolments: { include: { user: true, payment: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createCohort(
  input: CohortInput,
  imageDataUrl?: string
): Promise<ActionResult<{ id: string }>> {
  const session = await requirePermission("MANAGE_COHORTS");

  const parsed = cohortSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (parsed.data.endDate <= parsed.data.startDate) {
    return { ok: false, error: "End date must be after the start date." };
  }

  let image: string | undefined;
  let imagePublicId: string | undefined;
  if (imageDataUrl) {
    const uploaded = await uploadImageToCloudinary(imageDataUrl, "cohorts");
    image = uploaded.secureUrl;
    imagePublicId = uploaded.publicId;
  }

  const cohort = await prisma.cohort.create({
    data: {
      title: parsed.data.title,
      slug: slugify(parsed.data.title),
      description: parsed.data.description,
      price: parsed.data.price,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      duration: parsed.data.duration,
      modePolicy: parsed.data.modePolicy,
      capacity: parsed.data.capacity ?? null,
      image,
      imagePublicId,
      creatorId: session.user.id,
      status: "Upcoming",
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "CREATE",
    table: "YnCohort",
    message: `Created cohort "${cohort.title}" (${cohort.id}).`,
  });

  revalidatePath("/admin/academy");
  return { ok: true, data: { id: cohort.id } };
}

export async function updateCohort(
  id: string,
  input: CohortInput,
  imageDataUrl?: string
): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_COHORTS");

  const parsed = cohortSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (parsed.data.endDate <= parsed.data.startDate) {
    return { ok: false, error: "End date must be after the start date." };
  }

  const existing = await prisma.cohort.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Cohort not found." };

  let image = existing.image;
  let imagePublicId = existing.imagePublicId;
  if (imageDataUrl) {
    if (existing.imagePublicId) {
      await deleteImageFromCloudinary(existing.imagePublicId).catch(() => {});
    }
    const uploaded = await uploadImageToCloudinary(imageDataUrl, "cohorts");
    image = uploaded.secureUrl;
    imagePublicId = uploaded.publicId;
  }

  await prisma.cohort.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      duration: parsed.data.duration,
      modePolicy: parsed.data.modePolicy,
      capacity: parsed.data.capacity ?? null,
      image,
      imagePublicId,
    },
  });

  await logAction({
    actorId: session.user.id,
    action: "UPDATE",
    table: "YnCohort",
    message: `Updated cohort "${parsed.data.title}" (${id}).`,
  });

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/${id}`);
  return { ok: true };
}

export async function updateCohortStatus(
  id: string,
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled"
): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_COHORTS");

  const cohort = await prisma.cohort.findUnique({ where: { id } });
  if (!cohort) return { ok: false, error: "Cohort not found." };

  await prisma.cohort.update({ where: { id }, data: { status } });

  await logAction({
    actorId: session.user.id,
    action: "STATUS_CHANGE",
    table: "YnCohort",
    message: `Set cohort "${cohort.title}" status to ${status}.`,
  });

  revalidatePath("/admin/academy");
  revalidatePath(`/admin/academy/${id}`);
  return { ok: true };
}

export async function deleteCohort(id: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_COHORTS");

  const cohort = await prisma.cohort.findUnique({ where: { id } });
  if (!cohort) return { ok: false, error: "Cohort not found." };

  const enrolledCount = await prisma.cohortEnrolment.count({ where: { cohortId: id } });
  if (enrolledCount > 0) {
    return {
      ok: false,
      error: "This cohort has enrolled students and can't be deleted. Cancel it instead.",
    };
  }

  if (cohort.imagePublicId) {
    await deleteImageFromCloudinary(cohort.imagePublicId).catch(() => {});
  }
  await prisma.cohort.delete({ where: { id } });

  await logAction({
    actorId: session.user.id,
    action: "DELETE",
    table: "YnCohort",
    message: `Deleted cohort "${cohort.title}" (${id}).`,
  });

  revalidatePath("/admin/academy");
  return { ok: true };
}

/** Admin-side enrolment management: withdraw a student from a cohort. */
export async function adminUpdateEnrolmentStatus(
  enrolmentId: string,
  status: "Active" | "Completed" | "Withdrawn"
): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_ENROLMENTS");

  const enrolment = await prisma.cohortEnrolment.findUnique({
    where: { id: enrolmentId },
    include: { cohort: true, user: true },
  });
  if (!enrolment) return { ok: false, error: "Enrolment not found." };

  await prisma.cohortEnrolment.update({ where: { id: enrolmentId }, data: { status } });

  await logAction({
    actorId: session.user.id,
    action: "STATUS_CHANGE",
    table: "YnCohortEnrolment",
    message: `Set enrolment for ${enrolment.user.email} in "${enrolment.cohort.title}" to ${status}.`,
  });

  revalidatePath(`/admin/academy/${enrolment.cohortId}`);
  return { ok: true };
}

// ============================================================================
// ADMIN — BROADCASTS
// ============================================================================

export async function sendBroadcast(opts: {
  audience: "ALL" | "CUSTOMERS" | "STUDENTS";
  subject: string;
  body: string;
}): Promise<ActionResult<{ recipientCount: number }>> {
  const session = await requirePermission("SEND_BROADCASTS");

  const subject = opts.subject.trim();
  const body = opts.body.trim();
  if (subject.length < 2 || body.length < 5) {
    return { ok: false, error: "Please write a subject and message." };
  }

  const roleFilter =
    opts.audience === "CUSTOMERS"
      ? { roles: { some: { role: "Customer" as const } } }
      : opts.audience === "STUDENTS"
      ? { roles: { some: { role: "Student" as const } } }
      : {};

  const recipients = await prisma.user.findMany({
    where: { status: "Active", ...roleFilter },
    select: { id: true, email: true, firstname: true },
  });

  if (recipients.length === 0) {
    return { ok: false, error: "No active users match this audience." };
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      subject,
      body,
      recipients: {
        create: recipients.map((r) => ({ userId: r.id })),
      },
    },
  });

  await prisma.broadcast.create({
    data: {
      senderId: session.user.id,
      audience: opts.audience,
      subject,
      body,
      recipientCount: recipients.length,
    },
  });

  // Fire-and-forget emails — don't let one bad address block the rest.
  await Promise.allSettled(
    recipients.map((r) =>
      sendMail({
        to: r.email,
        subject,
        html: broadcastTemplate({ firstname: r.firstname, subject, body }),
        kind: "broadcast",
        userId: r.id,
      })
    )
  );

  await logAction({
    actorId: session.user.id,
    action: "BROADCAST",
    table: "YnBroadcast",
    message: `Sent broadcast "${subject}" to ${opts.audience} (${recipients.length} recipients).`,
  });

  revalidatePath("/admin/broadcasts");
  return { ok: true, data: { recipientCount: recipients.length } };
}

export async function getBroadcastHistory() {
  await requirePermission("SEND_BROADCASTS");
  return prisma.broadcast.findMany({
    orderBy: { createdAt: "desc" },
    include: { sender: true },
    take: 30,
  });
}

// ============================================================================
// SCHEDULED REMINDERS — cohort starting today / ending soon
// ============================================================================

const ENDING_SOON_WINDOW_DAYS = 3;

/**
 * Meant to be invoked on a daily schedule (e.g. a Vercel Cron job hitting a
 * route that calls this, or a GitHub Action / external scheduler). Sends:
 *  - a "starts today" email to every active enrollee, the day a cohort begins
 *  - an "ending soon" email once a cohort is within ENDING_SOON_WINDOW_DAYS of its end date
 * Uses the startReminderSentAt/endReminderSentAt flags on Cohort so each
 * email only ever goes out once per cohort, even if this runs more than
 * once on the same day.
 */
export async function runCohortReminders(): Promise<{ startEmailsSent: number; endEmailsSent: number }> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86_400_000);
  const endingSoonCutoff = new Date(todayStart.getTime() + ENDING_SOON_WINDOW_DAYS * 86_400_000);

  // --- Cohorts starting today ---
  const startingToday = await prisma.cohort.findMany({
    where: {
      startDate: { gte: todayStart, lt: todayEnd },
      startReminderSentAt: null,
      status: { in: ["Upcoming", "Ongoing"] },
    },
    include: { enrolments: { where: { status: "Active" }, include: { user: true } } },
  });

  let startEmailsSent = 0;
  for (const cohort of startingToday) {
    await Promise.allSettled(
      cohort.enrolments.map((e) =>
        sendMail({
          to: e.user.email,
          subject: `${cohort.title} starts today`,
          html: cohortStartingTemplate({
            firstname: e.user.firstname,
            cohortTitle: cohort.title,
            mode: e.mode,
          }),
          kind: "cohort",
          userId: e.userId,
        })
      )
    );
    startEmailsSent += cohort.enrolments.length;

    await prisma.cohort.update({ where: { id: cohort.id }, data: { startReminderSentAt: now } });

    if (cohort.status === "Upcoming") {
      await prisma.cohort.update({ where: { id: cohort.id }, data: { status: "Ongoing" } });
    }
  }

  // --- Cohorts ending within the reminder window ---
  const endingSoon = await prisma.cohort.findMany({
    where: {
      endDate: { gte: todayStart, lte: endingSoonCutoff },
      endReminderSentAt: null,
      status: "Ongoing",
    },
    include: { enrolments: { where: { status: "Active" }, include: { user: true } } },
  });

  let endEmailsSent = 0;
  for (const cohort of endingSoon) {
    const daysLeft = Math.max(0, Math.round((cohort.endDate.getTime() - now.getTime()) / 86_400_000));

    await Promise.allSettled(
      cohort.enrolments.map((e) =>
        sendMail({
          to: e.user.email,
          subject: `${cohort.title} ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
          html: cohortEndingSoonTemplate({
            firstname: e.user.firstname,
            cohortTitle: cohort.title,
            daysLeft,
          }),
          kind: "cohort",
          userId: e.userId,
        })
      )
    );
    endEmailsSent += cohort.enrolments.length;

    await prisma.cohort.update({ where: { id: cohort.id }, data: { endReminderSentAt: now } });
  }

  // --- Mark cohorts as Completed once their end date has fully passed ---
  await prisma.cohort.updateMany({
    where: { endDate: { lt: todayStart }, status: "Ongoing" },
    data: { status: "Completed" },
  });
  await prisma.cohortEnrolment.updateMany({
    where: { status: "Active", cohort: { endDate: { lt: todayStart } } },
    data: { status: "Completed" },
  });

  await logAction({
    actorId: null,
    action: "UPDATE",
    table: "YnCohort",
    message: `Cohort reminders run: ${startEmailsSent} start email(s), ${endEmailsSent} ending-soon email(s) sent.`,
  });

  return { startEmailsSent, endEmailsSent };
}

// ============================================================================
// ADMIN — CONTACT MESSAGES
// ============================================================================

export async function getAdminContactMessages() {
  await requirePermission("MANAGE_CONTACT_MESSAGES");
  return prisma.contact.findMany({
    where: { status: { not: "Deleted" } },
    orderBy: { createdAt: "desc" },
  });
}

export async function markContactMessageRead(id: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_CONTACT_MESSAGES");

  await prisma.contact.update({ where: { id }, data: { status: "Read" } });

  await logAction({
    actorId: session.user.id,
    action: "UPDATE",
    table: "YnContact",
    message: `Marked contact message ${id} as read.`,
  });

  revalidatePath("/admin/contact-messages");
  return { ok: true };
}

export async function deleteContactMessage(id: string): Promise<ActionResult> {
  const session = await requirePermission("MANAGE_CONTACT_MESSAGES");

  await prisma.contact.update({ where: { id }, data: { status: "Deleted" } });

  await logAction({
    actorId: session.user.id,
    action: "DELETE",
    table: "YnContact",
    message: `Deleted contact message ${id}.`,
  });

  revalidatePath("/admin/contact-messages");
  return { ok: true };
}

// ============================================================================
// ADMIN — REVENUE (super_admin only — full platform totals)
// ============================================================================

export async function getPlatformRevenueStats() {
  await requireSuperAdmin();

  const [orderRevenue, enrolmentRevenue, paymentsByMonth, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { purpose: "ORDER", status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { purpose: "ENROLMENT", status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      select: { amount: true, purpose: true, paidAt: true },
      orderBy: { paidAt: "asc" },
    }),
    prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 10,
      include: {
        order: { select: { orderNumber: true, email: true } },
        enrolment: { select: { user: { select: { email: true } }, cohort: { select: { title: true } } } },
      },
    }),
  ]);

  // Group into monthly buckets for a simple trend chart.
  const monthlyTotals = new Map<string, number>();
  for (const p of paymentsByMonth) {
    if (!p.paidAt) continue;
    const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
    monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + Number(p.amount));
  }

  return {
    totalOrderRevenue: Number(orderRevenue._sum.amount ?? 0),
    totalEnrolmentRevenue: Number(enrolmentRevenue._sum.amount ?? 0),
    totalRevenue: Number(orderRevenue._sum.amount ?? 0) + Number(enrolmentRevenue._sum.amount ?? 0),
    paidOrderCount: orderRevenue._count,
    paidEnrolmentCount: enrolmentRevenue._count,
    monthlyTotals: Array.from(monthlyTotals.entries()).map(([month, total]) => ({ month, total })),
    recentPayments,
  };
}

// ============================================================================
// ADMIN — AUDIT LOG
// ============================================================================

export async function getAuditLogs(page = 1, pageSize = 30) {
  await requirePermission("VIEW_LOGGER");

  const [logs, total] = await Promise.all([
    prisma.logger.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { firstname: true, lastname: true, email: true } } },
    }),
    prisma.logger.count(),
  ]);

  return { logs, total, page, pageSize };
}

// ============================================================================
// ADMIN — DASHBOARD OVERVIEW (charts & lists)
// ============================================================================

export async function getAdminDashboardOverview() {
  const ctx = await getAdminContext();
  if (!ctx) throw new UnauthorizedError();

  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    activeCohorts,
    totalUsers,
    recentUsers,
    recentProducts,
    recentCohorts,
    last7DaysOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "Pending" } }),
    prisma.product.count(),
    prisma.cohort.count({ where: { status: { in: ["Upcoming", "Ongoing"] } } }),
    prisma.user.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 7, include: { roles: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { images: true } }),
    prisma.cohort.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
      select: { createdAt: true, totalPrice: true, status: true },
    }),
  ]);

  // Build a 7-day order count/revenue series for the chart.
  const dayBuckets: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    const ordersOnDay = last7DaysOrders.filter((o) => o.createdAt.toISOString().slice(0, 10) === key);
    dayBuckets.push({
      date: key,
      orders: ordersOnDay.length,
      revenue: ordersOnDay.reduce((sum, o) => sum + Number(o.totalPrice), 0),
    });
  }

  return {
    totalOrders,
    pendingOrders,
    totalProducts,
    activeCohorts,
    totalUsers,
    recentUsers,
    recentProducts,
    recentCohorts,
    salesTrend: dayBuckets,
    isSuperAdmin: ctx.isSuperAdmin,
  };
}

// ============================================================================
// ADMIN — TEAM & ROLES (super_admin only)
// ============================================================================

export async function getAllUsersForTeamManagement(search?: string) {
  await requireSuperAdmin();

  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { firstname: { contains: search } },
            { lastname: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { roles: true, adminPermissions: true },
    take: 50,
  });
}

export async function promoteToAdmin(userId: string): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
  if (!user) return { ok: false, error: "User not found." };

  if (user.roles.some((r) => r.role === "SuperAdmin")) {
    return { ok: false, error: "This user is already a super admin." };
  }

  await prisma.userRole.upsert({
    where: { userId_role: { userId, role: "Admin" } },
    create: { userId, role: "Admin" },
    update: {},
  });

  await logAction({
    actorId: session.user.id,
    action: "ROLE_CHANGE",
    table: "YnUserRole",
    message: `Promoted ${user.email} to Admin.`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function demoteFromAdmin(userId: string): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  if (userId === session.user.id) {
    return { ok: false, error: "You can't demote yourself." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "User not found." };

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId, role: "Admin" } }),
    prisma.adminPermission.deleteMany({ where: { userId } }),
  ]);

  await logAction({
    actorId: session.user.id,
    action: "ROLE_CHANGE",
    table: "YnUserRole",
    message: `Removed Admin role from ${user.email}.`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function setAdminPermission(
  userId: string,
  type: AdminPermissionType,
  granted: boolean
): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
  if (!user) return { ok: false, error: "User not found." };
  if (!user.roles.some((r) => r.role === "Admin")) {
    return { ok: false, error: "This user isn't an admin." };
  }

  if (granted) {
    await prisma.adminPermission.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, grantedById: session.user.id },
      update: {},
    });
  } else {
    await prisma.adminPermission.deleteMany({ where: { userId, type } });
  }

  await logAction({
    actorId: session.user.id,
    action: "ROLE_CHANGE",
    table: "YnAdminPermission",
    message: `${granted ? "Granted" : "Revoked"} ${type} ${granted ? "to" : "from"} ${user.email}.`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

export async function getDashboardUser() {
  const session = await auth();
  if (!session?.user) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function getNotificationPreferences() {
  const session = await auth();
  if (!session?.user) return null;

  const pref = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    pref ?? {
      emailOrderUpdates: true,
      emailCohortReminders: true,
      emailBroadcasts: true,
      inAppNotifications: true,
    }
  );
}

export async function hasAnyEnrolment() {
  const session = await auth();
  if (!session?.user) return false;
  const count = await prisma.cohortEnrolment.count({ where: { userId: session.user.id } });
  return count > 0;
}

export async function getUnreadMessageCount() {
  const session = await auth();
  if (!session?.user) return 0;
  return prisma.messageRecipient.count({
    where: { userId: session.user.id, readAt: null },
  });
}

export async function getDashboardOverview() {
  const session = await auth();
  if (!session?.user) return null;

  const [recentOrders, activeEnrolments, unreadMessages] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: true },
    }),
    prisma.cohortEnrolment.findMany({
      where: { userId: session.user.id, status: "Active" },
      include: { cohort: true },
      orderBy: { cohort: { endDate: "asc" } },
    }),
    prisma.messageRecipient.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  const totalOrders = await prisma.order.count({ where: { userId: session.user.id } });

  return { recentOrders, activeEnrolments, unreadMessages, totalOrders };
}

// ============================================================================
// USER ORDERS
// ============================================================================

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { include: { images: true } } } }, payment: true },
  });
}

export async function getUserOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { include: { images: true } } } },
      payment: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || order.userId !== session.user.id) return null;
  return order;
}

// ============================================================================
// USER ACADEMY — enrolled cohorts with progression
// ============================================================================

export async function getUserEnrolments() {
  const session = await auth();
  if (!session?.user) return [];

  const enrolments = await prisma.cohortEnrolment.findMany({
    where: { userId: session.user.id },
    include: { cohort: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();

  return enrolments.map((e) => {
    const start = e.cohort.startDate.getTime();
    const end = e.cohort.endDate.getTime();
    const totalDays = Math.max(1, Math.round((end - start) / 86_400_000));
    const elapsedDays = Math.min(totalDays, Math.max(0, Math.round((now - start) / 86_400_000)));
    const daysLeft = Math.max(0, Math.round((end - now) / 86_400_000));
    const progressPercent = e.status === "Completed"
      ? 100
      : Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return { ...e, totalDays, daysLeft, progressPercent };
  });
}

// ============================================================================
// USER MESSAGES
// ============================================================================

export async function getUserMessages() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.messageRecipient.findMany({
    where: { userId: session.user.id },
    include: { message: { include: { sender: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function markMessageRead(recipientId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in." };

  const recipient = await prisma.messageRecipient.findUnique({ where: { id: recipientId } });
  if (!recipient || recipient.userId !== session.user.id) {
    return { ok: false, error: "Message not found." };
  }

  if (!recipient.readAt) {
    await prisma.messageRecipient.update({
      where: { id: recipientId },
      data: { readAt: new Date() },
    });
  }

  revalidatePath("/dashboard/messages");
  return { ok: true };
}

// ============================================================================
// PROFILE & SETTINGS
// ============================================================================

const profileSchema = z.object({
  firstname: z.string().trim().min(2).max(50),
  lastname: z.string().trim().min(2).max(50),
  phone: z.string().trim().max(20).optional(),
  defaultAddress: z.string().trim().max(255).optional(),
  defaultCity: z.string().trim().max(100).optional(),
  defaultState: z.string().trim().max(100).optional(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function updateNotificationPreferences(input: {
  emailOrderUpdates: boolean;
  emailCohortReminders: boolean;
  emailBroadcasts: boolean;
  inAppNotifications: boolean;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in." };

  await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...input },
    update: input,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.password) {
    return {
      ok: false,
      error: "Your account doesn't have a password set (likely signed up with Google).",
    };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return { ok: true };
}

export async function uploadAvatar(dataUrl: string): Promise<ActionResult<{ url: string }>> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please sign in." };

  const { uploadImageToCloudinary, deleteImageFromCloudinary } = await import("@/lib/cloudinary");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.imagePublicId) {
    await deleteImageFromCloudinary(user.imagePublicId).catch(() => {});
  }

  const { secureUrl, publicId } = await uploadImageToCloudinary(dataUrl, "avatars");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: secureUrl, imagePublicId: publicId },
  });

  revalidatePath("/dashboard/settings");
  return { ok: true, data: { url: secureUrl } };
}

// ============================================================================
// CHECKOUT & PAYMENTS (Paystack) — orders
// ============================================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Creates a Pending order from the user's current cart, snapshots prices
 * and product names onto OrderItem rows (so later price/name edits never
 * retroactively change a past order), then initializes a Paystack
 * transaction for the order total. Stock is NOT decremented here — only
 * once payment is verified — to avoid locking inventory on abandoned carts.
 */
export async function checkoutOrder(
  details: CheckoutDetailsInput
): Promise<ActionResult<{ authorizationUrl: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to check out." };
  }

  const parsed = checkoutDetailsSchema.safeParse(details);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // Re-validate stock and availability server-side right before charging.
  for (const item of cart.items) {
    if (item.product.status !== "Available") {
      return { ok: false, error: `"${item.product.name}" is no longer available.` };
    }
    if (item.product.qtyAvailable < item.quantity) {
      return {
        ok: false,
        error: `Only ${item.product.qtyAvailable} of "${item.product.name}" left in stock.`,
      };
    }
  }

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      fullname: parsed.data.fullname,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      notes: parsed.data.notes,
      totalPrice,
      status: "Pending",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      },
      statusHistory: { create: { status: "Pending", note: "Order created, awaiting payment." } },
    },
  });

  const reference = generatePaymentReference("ORD");

  await prisma.payment.create({
    data: {
      purpose: "ORDER",
      orderId: order.id,
      amount: totalPrice,
      status: "PENDING",
      reference,
    },
  });

  const init = await initializePaystackTransaction({
    email: parsed.data.email,
    amountNaira: totalPrice,
    reference,
    callbackUrl: `${APP_URL}/checkout/verify?reference=${reference}&type=order`,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });

  if (!init.status || !init.data) {
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return { ok: false, error: "We couldn't start the payment. Please try again." };
  }

  await prisma.payment.update({
    where: { reference },
    data: { authorizationUrl: init.data.authorization_url, status: "PROCESSING" },
  });

  // Cart is left intact until payment is confirmed, so the user can resume
  // checkout if they abandon the Paystack page.

  return { ok: true, data: { authorizationUrl: init.data.authorization_url } };
}

/**
 * Initializes payment for an existing AwaitingPayment cohort enrolment.
 * Re-derives the amount from the enrolment's own snapshotted price —
 * never from client input.
 */
export async function checkoutEnrolment(
  enrolmentId: string
): Promise<ActionResult<{ authorizationUrl: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to continue." };
  }

  const enrolment = await prisma.cohortEnrolment.findUnique({
    where: { id: enrolmentId },
    include: { cohort: true, payment: true },
  });

  if (!enrolment || enrolment.userId !== session.user.id) {
    return { ok: false, error: "Enrolment not found." };
  }
  if (enrolment.status !== "AwaitingPayment") {
    return { ok: false, error: "This enrolment isn't awaiting payment." };
  }

  // Reuse an existing pending payment record if one already exists for this
  // enrolment (e.g. user navigated back), otherwise create a fresh one.
  let reference: string;
  if (enrolment.payment && enrolment.payment.status !== "PAID") {
    reference = enrolment.payment.reference;
    await prisma.payment.update({
      where: { id: enrolment.payment.id },
      data: { amount: enrolment.price, status: "PENDING" },
    });
  } else {
    reference = generatePaymentReference("ENR");
    await prisma.payment.create({
      data: {
        purpose: "ENROLMENT",
        enrolmentId: enrolment.id,
        amount: enrolment.price,
        status: "PENDING",
        reference,
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "User not found." };

  const init = await initializePaystackTransaction({
    email: user.email,
    amountNaira: Number(enrolment.price),
    reference,
    callbackUrl: `${APP_URL}/checkout/verify?reference=${reference}&type=enrolment`,
    metadata: { enrolmentId: enrolment.id, cohortTitle: enrolment.cohort.title },
  });

  if (!init.status || !init.data) {
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return { ok: false, error: "We couldn't start the payment. Please try again." };
  }

  await prisma.payment.update({
    where: { reference },
    data: { authorizationUrl: init.data.authorization_url, status: "PROCESSING" },
  });

  return { ok: true, data: { authorizationUrl: init.data.authorization_url } };
}

/**
 * Verifies a payment against Paystack directly (never trusts the redirect
 * query string alone), then — on success — finalizes the underlying order
 * or enrolment: decrements stock / updates statuses, sends confirmation
 * email, and clears the cart for order payments.
 */
export async function verifyPayment(
  reference: string
): Promise<ActionResult<{ type: "order" | "enrolment"; orderNumber?: string; cohortTitle?: string }>> {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) return { ok: false, error: "Payment record not found." };

  // Already verified previously (e.g. user refreshed the verify page) — short-circuit.
  if (payment.status === "PAID") {
    if (payment.purpose === "ORDER" && payment.orderId) {
      const order = await prisma.order.findUnique({ where: { id: payment.orderId } });
      return { ok: true, data: { type: "order", orderNumber: order?.orderNumber } };
    }
    if (payment.purpose === "ENROLMENT" && payment.enrolmentId) {
      const enrolment = await prisma.cohortEnrolment.findUnique({
        where: { id: payment.enrolmentId },
        include: { cohort: true },
      });
      return { ok: true, data: { type: "enrolment", cohortTitle: enrolment?.cohort.title } };
    }
  }

  const verification = await verifyPaystackTransaction(reference);

  if (!verification.status || !verification.data || verification.data.status !== "success") {
    await prisma.payment.update({ where: { reference }, data: { status: "FAILED" } });
    return { ok: false, error: "Payment was not successful. Please try again." };
  }

  const { data } = verification;

  // Defense in depth: confirm the amount Paystack charged matches what we
  // expect, in case of any reference reuse or tampering.
  const expectedKobo = Math.round(Number(payment.amount) * 100);
  if (data.amount !== expectedKobo) {
    await logAction({
      actorId: null,
      action: "UPDATE",
      table: "YnPayment",
      message: `Amount mismatch on payment ${reference}: expected ${expectedKobo} kobo, Paystack reports ${data.amount} kobo.`,
    });
    return { ok: false, error: "Payment amount mismatch. Please contact support." };
  }

  await prisma.payment.update({
    where: { reference },
    data: {
      status: "PAID",
      paidAt: data.paid_at ? new Date(data.paid_at) : new Date(),
      channel: data.channel,
      paystackRef: data.reference,
    },
  });

  if (payment.purpose === "ORDER" && payment.orderId) {
    const order = await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "Confirmed",
        statusHistory: { create: { status: "Confirmed", note: "Payment received." } },
      },
      include: { items: true },
    });

    // Decrement stock now that payment is confirmed, and clear the cart —
    // all inside a transaction so a partial failure can't desync inventory.
    await prisma.$transaction([
      ...order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { qtyAvailable: { decrement: item.quantity } },
        })
      ),
      prisma.cartItem.deleteMany({ where: { cart: { userId: order.userId } } }),
    ]);

    const itemsHtml = order.items
      .map((i) => `<p style="margin:2px 0;">${i.quantity} × ${i.productName}</p>`)
      .join("");

    await sendMail({
      to: order.email,
      subject: `Order ${order.orderNumber} received`,
      html: orderReceivedTemplate({
        firstname: order.fullname.split(" ")[0],
        orderNumber: order.orderNumber,
        total: new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
          Number(order.totalPrice)
        ),
        itemsHtml,
      }),
      kind: "order",
      userId: order.userId,
    });

    return { ok: true, data: { type: "order", orderNumber: order.orderNumber } };
  }

  if (payment.purpose === "ENROLMENT" && payment.enrolmentId) {
    const enrolment = await prisma.cohortEnrolment.update({
      where: { id: payment.enrolmentId },
      data: { status: "Active" },
      include: { cohort: true, user: true },
    });

    await sendMail({
      to: enrolment.user.email,
      subject: `You're enrolled in ${enrolment.cohort.title}`,
      html: enrolmentConfirmedTemplate({
        firstname: enrolment.user.firstname,
        cohortTitle: enrolment.cohort.title,
        startDate: new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(enrolment.cohort.startDate),
        mode: enrolment.mode,
      }),
      kind: "cohort",
      userId: enrolment.userId,
    });

    return { ok: true, data: { type: "enrolment", cohortTitle: enrolment.cohort.title } };
  }

  return { ok: false, error: "Unable to determine what this payment was for." };
}

// ============================================================================
// COHORT ENROLMENT — requires authentication
// ============================================================================

export async function enrolInCohort(
  cohortId: string,
  mode: "Physical" | "Online"
): Promise<ActionResult<{ enrolmentId: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to enrol in a cohort." };
  }

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) return { ok: false, error: "This cohort doesn't exist." };
  if (cohort.status === "Completed" || cohort.status === "Cancelled") {
    return { ok: false, error: "This cohort is no longer open for enrolment." };
  }

  // Resolve the actual mode to store, respecting the cohort's mode policy.
  let resolvedMode: "Physical" | "Online";
  if (cohort.modePolicy === "PhysicalOnly") resolvedMode = "Physical";
  else if (cohort.modePolicy === "OnlineOnly") resolvedMode = "Online";
  else resolvedMode = mode;

  if (cohort.capacity != null) {
    const count = await prisma.cohortEnrolment.count({
      where: { cohortId, status: { not: "Withdrawn" } },
    });
    if (count >= cohort.capacity) {
      return { ok: false, error: "This cohort is full." };
    }
  }

  const existing = await prisma.cohortEnrolment.findUnique({
    where: { cohortId_userId: { cohortId, userId: session.user.id } },
  });
  if (existing && existing.status !== "Withdrawn") {
    return { ok: false, error: "You're already enrolled in this cohort." };
  }

  const enrolment = existing
    ? await prisma.cohortEnrolment.update({
        where: { id: existing.id },
        data: { mode: resolvedMode, price: cohort.price, status: "AwaitingPayment" },
      })
    : await prisma.cohortEnrolment.create({
        data: {
          cohortId,
          userId: session.user.id,
          mode: resolvedMode,
          price: cohort.price,
          status: "AwaitingPayment",
        },
      });

  // Ensure the user carries the Student role once they attempt enrolment —
  // used for broadcast targeting and dashboard "Academy" tab visibility.
  await prisma.userRole.upsert({
    where: { userId_role: { userId: session.user.id, role: "Student" } },
    create: { userId: session.user.id, role: "Student" },
    update: {},
  });

  return { ok: true, data: { enrolmentId: enrolment.id } };
}

export async function getEnrolmentById(enrolmentId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const enrolment = await prisma.cohortEnrolment.findUnique({
    where: { id: enrolmentId },
    include: { cohort: true },
  });

  if (!enrolment || enrolment.userId !== session.user.id) return null;
  return enrolment;
}

export async function getCart() {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { include: { images: { orderBy: { position: "asc" } } } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function addToCart(productId: string, quantity = 1): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to add items to your cart." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "Available") {
    return { ok: false, error: "This product isn't available right now." };
  }
  if (product.qtyAvailable < quantity) {
    return { ok: false, error: `Only ${product.qtyAvailable} left in stock.` };
  }

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  revalidatePath("/cart");
  return { ok: true };
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to manage your cart." };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });
  if (!item || item.cart.userId !== session.user.id) {
    return { ok: false, error: "Cart item not found." };
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    if (quantity > item.product.qtyAvailable) {
      return { ok: false, error: `Only ${item.product.qtyAvailable} left in stock.` };
    }
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  revalidatePath("/cart");
  return { ok: true };
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Please sign in to manage your cart." };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });
  if (!item || item.cart.userId !== session.user.id) {
    return { ok: false, error: "Cart item not found." };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
  return { ok: true };
}
