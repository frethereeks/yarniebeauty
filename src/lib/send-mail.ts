import { mailer, EMAIL_FROM } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

type NotificationKind = "order" | "cohort" | "broadcast" | "transactional";

/**
 * Sends an email, but for non-transactional kinds (order updates, cohort
 * reminders, broadcasts) first checks the user's notification preferences
 * and silently skips if they've opted out. Transactional mail — email
 * confirmation, password reset — always sends regardless of preference,
 * since those are required for account security, not marketing.
 *
 * IMPORTANT: this never throws. Email delivery is a side effect, not the
 * core operation of whatever called it (e.g. registerUser already
 * committed the new account to the database before this runs) — a slow or
 * unreachable SMTP server must never take down the request that triggered
 * it. Failures are logged to the server console and swallowed; the action
 * result returned to the UI always reflects success or failure of the
 * actual business operation, not of the email send.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  kind: NotificationKind;
  userId?: string;
}): Promise<{ sent: boolean; error?: string }> {
  try {
    if (opts.kind !== "transactional" && opts.userId) {
      const pref = await prisma.notificationPreference.findUnique({
        where: { userId: opts.userId },
      });

      if (pref) {
        if (opts.kind === "order" && !pref.emailOrderUpdates) return { sent: false };
        if (opts.kind === "cohort" && !pref.emailCohortReminders) return { sent: false };
        if (opts.kind === "broadcast" && !pref.emailBroadcasts) return { sent: false };
      }
    }

    await mailer.sendMail({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    return { sent: true };
  } catch (err) {
    // Log loudly so this is visible during development/ops, but never
    // propagate — a broken SMTP config should degrade to "email didn't
    // go out" rather than "the whole page crashed".
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error(`[sendMail] Failed to send "${opts.subject}" to ${opts.to}:`, message);
    return { sent: false, error: message };
  }
}
