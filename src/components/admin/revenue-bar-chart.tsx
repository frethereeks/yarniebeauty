"use client";

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function RevenueBarChart({ data }: { data: { month: string; total: number }[] }) {
  if (data.length === 0) {
    return <p className="text-text-on-cream-muted text-sm">No payment history yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex items-end justify-center" style={{ height: 160 }}>
            <div
              className="w-full bg-gold hover:bg-gold-bright transition-colors"
              style={{ height: `${Math.max(4, (d.total / max) * 160)}px` }}
              title={currency.format(d.total)}
            />
          </div>
          <span className="text-xs text-text-on-cream-muted">{d.month.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
