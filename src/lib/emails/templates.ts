import { emailShell } from "./shell";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function confirmEmailTemplate(firstname: string, token: string) {
  return emailShell({
    preheader: "Confirm your email to activate your Yarniebeauty account",
    heading: `Welcome, ${firstname}`,
    bodyHtml: `<p>Thanks for creating an account with Yarniebeauty. Confirm your email address to activate your account and start shopping or enrolling in the academy.</p>
    <p>This link expires in 24 hours.</p>`,
    ctaLabel: "Confirm my email",
    ctaUrl: `${APP_URL}/verify-email?token=${token}`,
  });
}

export function passwordResetTemplate(firstname: string, token: string) {
  return emailShell({
    preheader: "Reset your Yarniebeauty password",
    heading: `Reset your password, ${firstname}`,
    bodyHtml: `<p>We received a request to reset the password on your account. If this wasn't you, you can safely ignore this email.</p>
    <p>This link expires in 1 hour.</p>`,
    ctaLabel: "Reset password",
    ctaUrl: `${APP_URL}/reset-password?token=${token}`,
  });
}

export function orderReceivedTemplate(opts: {
  firstname: string;
  orderNumber: string;
  total: string;
  itemsHtml: string;
}) {
  return emailShell({
    preheader: `We've received your order ${opts.orderNumber}`,
    heading: "Your order has been received",
    bodyHtml: `<p>Hi ${opts.firstname}, thank you for your order. We're preparing it with care.</p>
      <p style="margin:20px 0 8px;"><strong>Order ${opts.orderNumber}</strong></p>
      ${opts.itemsHtml}
      <p style="margin-top:16px;"><strong>Total: ${opts.total}</strong></p>`,
    ctaLabel: "View order",
    ctaUrl: `${APP_URL}/dashboard/orders`,
  });
}

export function orderStatusChangedTemplate(opts: {
  firstname: string;
  orderNumber: string;
  status: string;
  note?: string;
}) {
  return emailShell({
    preheader: `Order ${opts.orderNumber} is now ${opts.status}`,
    heading: "Your order status has been updated",
    bodyHtml: `<p>Hi ${opts.firstname}, your order <strong>${opts.orderNumber}</strong> is now:</p>
      <p style="font-size:18px;font-weight:600;color:#9C7D1D;margin:12px 0;">${opts.status}</p>
      ${opts.note ? `<p>${opts.note}</p>` : ""}`,
    ctaLabel: "Track order",
    ctaUrl: `${APP_URL}/dashboard/orders`,
  });
}

export function cohortStartingTemplate(opts: {
  firstname: string;
  cohortTitle: string;
  mode: string;
}) {
  return emailShell({
    preheader: `${opts.cohortTitle} starts today`,
    heading: "Your cohort starts today",
    bodyHtml: `<p>Hi ${opts.firstname}, today's the day — <strong>${opts.cohortTitle}</strong> begins.</p>
      <p>Mode: <strong>${opts.mode}</strong></p>
      <p>Head to your dashboard for everything you need to get started.</p>`,
    ctaLabel: "Go to my academy",
    ctaUrl: `${APP_URL}/dashboard/academy`,
  });
}

export function cohortEndingSoonTemplate(opts: {
  firstname: string;
  cohortTitle: string;
  daysLeft: number;
}) {
  return emailShell({
    preheader: `${opts.cohortTitle} ends in ${opts.daysLeft} day(s)`,
    heading: "Your cohort is wrapping up soon",
    bodyHtml: `<p>Hi ${opts.firstname}, <strong>${opts.cohortTitle}</strong> ends in <strong>${opts.daysLeft} day${opts.daysLeft === 1 ? "" : "s"}</strong>.</p>
      <p>Make the most of the time left — review the materials and reach out if you need anything before it closes.</p>`,
    ctaLabel: "Go to my academy",
    ctaUrl: `${APP_URL}/dashboard/academy`,
  });
}

export function enrolmentConfirmedTemplate(opts: {
  firstname: string;
  cohortTitle: string;
  startDate: string;
  mode: string;
}) {
  return emailShell({
    preheader: `You're enrolled in ${opts.cohortTitle}`,
    heading: "You're enrolled!",
    bodyHtml: `<p>Hi ${opts.firstname}, your enrolment in <strong>${opts.cohortTitle}</strong> is confirmed.</p>
      <p>Start date: <strong>${opts.startDate}</strong><br/>Mode: <strong>${opts.mode}</strong></p>`,
    ctaLabel: "View my academy",
    ctaUrl: `${APP_URL}/dashboard/academy`,
  });
}

export function broadcastTemplate(opts: { firstname: string; subject: string; body: string }) {
  return emailShell({
    preheader: opts.subject,
    heading: opts.subject,
    bodyHtml: `<p>Hi ${opts.firstname},</p><p>${opts.body.replace(/\n/g, "<br/>")}</p>`,
  });
}
