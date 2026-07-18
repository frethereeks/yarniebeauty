import { getAdminOrders } from "@/actions";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const ordersData = orders.map(el => ({...el, totalPrice: +(el.totalPrice)}))

  return (
    <div>
      <h1 className="text-display-lg mb-8">Orders</h1>
      <div className="bg-white border border-line overflow-x-scroll md:overflow-clip">
        <OrdersTable orders={ordersData} />
      </div>
    </div>
  );
}
