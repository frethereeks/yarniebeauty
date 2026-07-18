import { NextRequest, NextResponse } from "next/server";
import { runCohortReminders } from "@/actions";

/**
 * Triggered by an external scheduler (Vercel Cron, GitHub Actions cron,
 * cron-job.org, etc.) once a day. This is intentionally a route handler,
 * not a server action — schedulers can only call real HTTP endpoints, the
 * same reason NextAuth's OAuth callback needs one. All other business
 * logic in this app stays in actions/index.ts as server actions.
 *
 * Protect this by setting CRON_SECRET in your environment. Most schedulers
 * (cron-job.org, GitHub Actions) can send a Bearer header:
 *   Authorization: Bearer <CRON_SECRET>
 * Vercel Cron cannot set custom headers, so this route also accepts the
 * secret as a query param instead:
 *   /api/cron/cohort-reminders?secret=<CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  const isAuthorized =
    !!expected && (authHeader === `Bearer ${expected}` || queryToken === expected);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCohortReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cohort reminders cron failed:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
