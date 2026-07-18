"use client";

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function SalesTrendChart({ data }: { data: { date: string; orders: number; revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => {
        const dayLabel = new Date(d.date).toLocaleDateString("en-GB", { weekday: "short" });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex items-end justify-center" style={{ height: 120 }}>
              <div
                className="w-full bg-gold hover:bg-gold-bright transition-colors"
                style={{ height: `${Math.max(3, (d.revenue / maxRevenue) * 120)}px` }}
                title={`${currency.format(d.revenue)} · ${d.orders} order${d.orders === 1 ? "" : "s"}`}
              />
            </div>
            <span className="text-xs text-text-on-cream-muted">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
