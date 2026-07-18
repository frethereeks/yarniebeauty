import Link from "next/link";
import { getUserOrders } from "@/actions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-warning/15 text-warning",
  Confirmed: "bg-gold/15 text-gold-deep",
  Processing: "bg-gold/15 text-gold-deep",
  OutForDelivery: "bg-gold/15 text-gold-deep",
  Delivered: "bg-success/15 text-success",
  Returned: "bg-error/15 text-error",
  Cancelled: "bg-error/15 text-error",
};

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div>
      <h1 className="text-display-lg mb-10">Your orders</h1>

      {orders.length === 0 ? (
        <div className="border border-line border-dashed p-12 text-center">
          <p className="text-text-on-cream-muted mb-4">You haven't placed any orders yet.</p>
          <Link href="/products" className="text-gold-deep underline underline-offset-2">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block border border-line p-6 hover:border-gold-deep transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-text-on-cream-muted mt-1">
                    Placed {dateFmt.format(order.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 ${STATUS_STYLES[order.status] ?? ""}`}>
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
    </div>
  );
}
