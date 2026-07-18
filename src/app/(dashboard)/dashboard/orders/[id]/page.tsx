import { notFound } from "next/navigation";
import Image from "next/image";
import { getUserOrderById } from "@/actions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getUserOrderById(id);

  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-10">
        <div>
          <p className="text-eyebrow text-gold-deep mb-2">Order</p>
          <h1 className="text-display-lg">{order.orderNumber}</h1>
        </div>
        <span className="text-sm font-semibold px-4 py-2 border border-gold-deep text-gold-deep">
          {order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div>
            <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Items</h2>
            <div className="border border-line divide-y divide-line">
              {order.items.map((item) => {
                const primary = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
                return (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="relative w-16 h-20 bg-cream-soft flex-shrink-0 overflow-hidden">
                      {primary && (
                        <Image src={primary.secureUrl} alt={item.productName} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-text-on-cream-muted">
                        {item.quantity} × {currency.format(Number(item.price))}
                      </p>
                    </div>
                    <p className="font-medium">{currency.format(Number(item.price) * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status timeline */}
          <div>
            <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Status history</h2>
            <div className="space-y-4">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{entry.status}</p>
                    {entry.note && <p className="text-sm text-text-on-cream-muted">{entry.note}</p>}
                    <p className="text-xs text-text-on-cream-muted mt-0.5">{dateFmt.format(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-line p-6">
            <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Delivery details</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={order.fullname} />
              <Row label="Phone" value={order.phone} />
              <Row label="Address" value={`${order.address}, ${order.city}, ${order.state}`} />
              {order.notes && <Row label="Notes" value={order.notes} />}
            </dl>
          </div>

          <div className="border border-line p-6">
            <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Payment</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Status" value={order.payment?.status ?? "—"} />
              <Row label="Total" value={currency.format(Number(order.totalPrice))} />
              {order.payment?.channel && <Row label="Channel" value={order.payment.channel} />}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-on-cream-muted">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}
