import Link from "next/link";
import Image from "next/image";
import { getAdminDashboardOverview } from "@/actions";
import { SalesTrendChart } from "@/components/admin/sales-trend-chart";

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardOverview();

  const weeklyRevenue = data.salesTrend.reduce((sum, d) => sum + d.revenue, 0);
  const weeklyOrders = data.salesTrend.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div>
      <h1 className="text-display-lg mb-8">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total orders" value={String(data.totalOrders)} />
        <StatCard label="Pending orders" value={String(data.pendingOrders)} />
        <StatCard label="Active products" value={String(data.totalProducts)} />
        <StatCard label="Open cohorts" value={String(data.activeCohorts)} />
      </div>

      <div className="bg-white border border-line p-7 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-eyebrow text-text-on-cream-muted">Last 7 days</h2>
          <p className="text-sm text-text-on-cream-muted">
            {weeklyOrders} order{weeklyOrders === 1 ? "" : "s"} · {currency.format(weeklyRevenue)}
          </p>
        </div>
        <SalesTrendChart data={data.salesTrend} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <section>
          <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Recent users (last 7)</h2>
          <div className="bg-white border border-line divide-y divide-line">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="p-4">
                <p className="text-sm font-medium">{u.firstname} {u.lastname}</p>
                <p className="text-xs text-text-on-cream-muted">{u.email}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {u.roles.map((r) => (
                    <span key={r.role} className="text-[10px] bg-cream-soft text-gold-deep px-1.5 py-0.5">
                      {r.role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {data.recentUsers.length === 0 && <p className="p-4 text-sm text-text-on-cream-muted">No users yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-eyebrow text-text-on-cream-muted">Recent products (last 10)</h2>
            <Link href="/admin/products" className="text-xs text-gold-deep underline underline-offset-2">
              View all
            </Link>
          </div>
          <div className="bg-white border border-line divide-y divide-line">
            {data.recentProducts.map((p) => {
              const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
              return (
                <Link key={p.id} href={`/admin/products/${p.id}`} className="flex gap-3 p-4 hover:bg-cream-soft transition-colors">
                  <div className="relative w-9 h-11 bg-cream-soft flex-shrink-0 overflow-hidden">
                    {primary && <Image src={primary.secureUrl} alt="" fill sizes="36px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-text-on-cream-muted">{p.status}</p>
                  </div>
                </Link>
              );
            })}
            {data.recentProducts.length === 0 && (
              <p className="p-4 text-sm text-text-on-cream-muted">No products yet.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-eyebrow text-text-on-cream-muted">Recent cohorts (last 5)</h2>
            <Link href="/admin/academy" className="text-xs text-gold-deep underline underline-offset-2">
              View all
            </Link>
          </div>
          <div className="bg-white border border-line divide-y divide-line">
            {data.recentCohorts.map((c) => (
              <Link key={c.id} href={`/admin/academy/${c.id}`} className="block p-4 hover:bg-cream-soft transition-colors">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-xs text-text-on-cream-muted">
                  {dateFmt.format(c.startDate)} – {dateFmt.format(c.endDate)} · {c.status}
                </p>
              </Link>
            ))}
            {data.recentCohorts.length === 0 && (
              <p className="p-4 text-sm text-text-on-cream-muted">No cohorts yet.</p>
            )}
          </div>
        </section>
      </div>

      {data.isSuperAdmin && (
        <div className="mt-10 border border-gold bg-ink text-cream p-6">
          <p className="text-sm">
            As Super Admin, you have access to{" "}
            <Link href="/admin/revenue" className="text-gold-bright underline underline-offset-2">
              platform-wide revenue
            </Link>{" "}
            and{" "}
            <Link href="/admin/team" className="text-gold-bright underline underline-offset-2">
              team &amp; role management
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-2xl font-display text-gold-deep mb-1">{value}</p>
      <p className="text-xs text-text-on-cream-muted">{label}</p>
    </div>
  );
}
