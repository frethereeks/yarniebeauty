import Link from "next/link";
import { getUserEnrolments } from "@/actions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_STYLES: Record<string, string> = {
  AwaitingPayment: "bg-warning/15 text-warning",
  Active: "bg-gold/15 text-gold-deep",
  Completed: "bg-success/15 text-success",
  Withdrawn: "bg-error/15 text-error",
};

export default async function AcademyPage() {
  const enrolments = await getUserEnrolments();

  return (
    <div>
      <h1 className="text-display-lg mb-10">Your academy</h1>

      {enrolments.length === 0 ? (
        <div className="border border-line border-dashed p-12 text-center">
          <p className="text-text-on-cream-muted mb-4">You haven't enrolled in any cohorts yet.</p>
          <Link href="/academy" className="text-gold-deep underline underline-offset-2">
            Explore the academy
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enrolments.map((e) => (
            <div key={e.id} className="border border-line p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-display text-xl mb-1">{e.cohort.title}</h2>
                  <p className="text-sm text-text-on-cream-muted">
                    {e.mode === "Online" ? "Online" : "In-person"} ·{" "}
                    {dateFmt.format(e.cohort.startDate)} – {dateFmt.format(e.cohort.endDate)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 ${STATUS_STYLES[e.status] ?? ""}`}>
                  {e.status === "AwaitingPayment" ? "Payment pending" : e.status}
                </span>
              </div>

              {e.status === "AwaitingPayment" && (
                <Link
                  href={`/checkout/enrolment/${e.id}`}
                  className="inline-flex items-center px-5 py-2.5 bg-gold text-ink text-eyebrow font-semibold hover:bg-gold-bright transition-colors mb-2"
                >
                  Complete payment
                </Link>
              )}

              {(e.status === "Active" || e.status === "Completed") && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-on-cream-muted">
                      {e.status === "Completed"
                        ? "Cohort completed"
                        : e.daysLeft > 0
                        ? `${e.daysLeft} day${e.daysLeft === 1 ? "" : "s"} left`
                        : "Wrapping up"}
                    </span>
                    <span className="font-medium">{e.progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-cream-soft overflow-hidden">
                    <div className="h-full bg-gold transition-all" style={{ width: `${e.progressPercent}%` }} />
                  </div>
                </div>
              )}

              <p className="text-xs text-text-on-cream-muted mt-4">
                Paid {currency.format(Number(e.price))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
