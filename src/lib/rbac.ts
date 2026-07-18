import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AdminPermissionType } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "You don't have permission to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Throws if there's no logged-in user. Returns the session otherwise. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("You need to be signed in.");
  return session;
}

/** Throws unless the current user is SuperAdmin or Admin. */
export async function requireAdmin() {
  const session = await requireUser();
  const roles = session.user.roles ?? [];
  if (!roles.includes("SuperAdmin") && !roles.includes("Admin")) {
    throw new UnauthorizedError("Admins only.");
  }
  return session;
}

/** Throws unless the current user is SuperAdmin. */
export async function requireSuperAdmin() {
  const session = await requireUser();
  if (!session.user.roles?.includes("SuperAdmin")) {
    throw new UnauthorizedError("Super admins only.");
  }
  return session;
}

/**
 * For regular Admins, checks a specific granted permission.
 * SuperAdmins always pass — they implicitly have every permission.
 */
export async function requirePermission(type: AdminPermissionType) {
  const session = await requireAdmin();
  if (session.user.roles?.includes("SuperAdmin")) return session;

  const grant = await prisma.adminPermission.findUnique({
    where: { userId_type: { userId: session.user.id, type } },
  });
  if (!grant) {
    throw new UnauthorizedError("You don't have permission to do this.");
  }
  return session;
}
