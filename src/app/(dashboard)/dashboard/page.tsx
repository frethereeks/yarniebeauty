import Link from "next/link";
import { getDashboardOverview, getDashboardUser } from "@/actions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "text-warning",
  Confirmed: "text-gold-deep",
  Processing: "text-gold-deep",
  OutForDelivery: "text-gold-deep",
  Delivered: "text-success",
  Returned: "text-error",
  Cancelled: "text-error",
};

export default async function DashboardOverviewPage() {
  const [overview, user] = await Promise.all([getDashboardOverview(), getDashboardUser()]);

  if (!overview || !user) return null;

  return (
    <div>
      <p className="text-eyebrow text-gold-deep mb-2">Welcome back</p>
      <h1 className="text-display-lg mb-10">{user.firstname}</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
        <StatCard label="Total orders" value={String(overview.totalOrders)} />
        <StatCard label="Active cohorts" value={String(overview.activeEnrolments.length)} />
        <StatCard label="Unread messages" value={String(overview.unreadMessages)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-sm text-gold-deep underline underline-offset-2">
              View all
            </Link>
          </div>
          {overview.recentOrders.length === 0 ? (
            <EmptyCard text="No orders yet." ctaHref="/products" ctaLabel="Browse the shop" />
          ) : (
            <div className="space-y-3">
              {overview.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block border border-line p-5 hover:border-gold-deep transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{order.orderNumber}</p>
                    <span className={`text-xs font-semibold ${ORDER_STATUS_COLORS[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-on-cream-muted">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                    {currency.format(Number(order.totalPrice))}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Active cohorts */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl">Your academy progress</h2>
            <Link href="/dashboard/academy" className="text-sm text-gold-deep underline underline-offset-2">
              View all
            </Link>
          </div>
          {overview.activeEnrolments.length === 0 ? (
            <EmptyCard text="No active cohorts." ctaHref="/academy" ctaLabel="Explore the academy" />
          ) : (
            <div className="space-y-3">
              {overview.activeEnrolments.map((enrolment) => {
                const totalDays = Math.max(
                  1,
                  Math.round(
                    (enrolment.cohort.endDate.getTime() - enrolment.cohort.startDate.getTime()) / 86_400_000
                  )
                );
                const daysLeft = Math.max(
                  0,
                  Math.round((enrolment.cohort.endDate.getTime() - Date.now()) / 86_400_000)
                );
                const progress = Math.min(
                  100,
                  Math.max(0, Math.round(((totalDays - daysLeft) / totalDays) * 100))
                );

                return (
                  <div key={enrolment.id} className="border border-line p-5">
                    <p className="font-medium mb-1">{enrolment.cohort.title}</p>
                    <p className="text-sm text-text-on-cream-muted mb-3">
                      {daysLeft > 0
                        ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
                        : "Wrapping up"}{" "}
                      · Ends {dateFmt.format(enrolment.cohort.endDate)}
                    </p>
                    <div className="h-1.5 bg-cream-soft overflow-hidden">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-5">
      <p className="text-2xl font-display text-gold-deep mb-1">{value}</p>
      <p className="text-xs text-text-on-cream-muted">{label}</p>
    </div>
  );
}

function EmptyCard({ text, ctaHref, ctaLabel }: { text: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="border border-line border-dashed p-7 text-center">
      <p className="text-text-on-cream-muted text-sm mb-3">{text}</p>
      <Link href={ctaHref} className="text-sm text-gold-deep underline underline-offset-2">
        {ctaLabel}
      </Link>
    </div>
  );
}
