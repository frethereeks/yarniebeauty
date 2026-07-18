import { getPlatformRevenueStats } from "@/actions";
import { RevenueBarChart } from "@/components/admin/revenue-bar-chart";

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function RevenuePage() {
  const stats = await getPlatformRevenueStats();

  return (
    <div>
      <h1 className="text-display-lg mb-2">Revenue</h1>
      <p className="text-text-on-cream-muted mb-10">
        Total payments received across the platform, all time.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <StatCard label="Total revenue" value={currency.format(stats.totalRevenue)} highlight />
        <StatCard
          label="From orders"
          value={currency.format(stats.totalOrderRevenue)}
          sub={`${stats.paidOrderCount} paid order${stats.paidOrderCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="From academy"
          value={currency.format(stats.totalEnrolmentRevenue)}
          sub={`${stats.paidEnrolmentCount} paid enrolment${stats.paidEnrolmentCount === 1 ? "" : "s"}`}
        />
      </div>

      <div className="bg-white border border-line p-7 mb-12">
        <h2 className="text-eyebrow text-text-on-cream-muted mb-6">Monthly revenue</h2>
        <RevenueBarChart data={stats.monthlyTotals} />
      </div>

      <div>
        <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Recent payments</h2>
        <div className="bg-white border border-line divide-y divide-line">
          {stats.recentPayments.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-4">
              <div>
                <p className="text-sm font-medium">
                  {p.order ? `Order ${p.order.orderNumber}` : p.enrolment?.cohort.title ?? "—"}
                </p>
                <p className="text-xs text-text-on-cream-muted">
                  {p.order?.email ?? p.enrolment?.user.email} · {p.paidAt ? dateFmt.format(p.paidAt) : "—"}
                </p>
              </div>
              <p className="font-medium">{currency.format(Number(p.amount))}</p>
            </div>
          ))}
          {stats.recentPayments.length === 0 && (
            <p className="p-6 text-text-on-cream-muted text-sm">No payments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`border p-6 ${highlight ? "border-gold bg-ink text-cream" : "border-line bg-white"}`}>
      <p className={`text-2xl font-display mb-1 ${highlight ? "text-gold-bright" : "text-gold-deep"}`}>{value}</p>
      <p className={`text-xs ${highlight ? "text-cream/70" : "text-text-on-cream-muted"}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 ${highlight ? "text-cream/50" : "text-text-on-cream-muted"}`}>{sub}</p>}
    </div>
  );
}
