"use client";

import Link from "next/link";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number | string;
  createdAt: Date;
  items: { id: string }[];
  user: { firstname: string; lastname: string; email: string };
  payment: { status: string } | null;
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS: Record<string, string> = {
  Pending: "orange",
  Confirmed: "gold",
  Processing: "gold",
  OutForDelivery: "blue",
  Delivered: "green",
  Returned: "red",
  Cancelled: "red",
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const columns: ColumnsType<OrderRow> = [
    {
      title: "Order",
      key: "orderNumber",
      render: (_, o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-gold-deep">
          {o.orderNumber}
        </Link>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, o) => (
        <div>
          <p className="text-sm">{o.user.firstname} {o.user.lastname}</p>
          <p className="text-xs text-text-on-cream-muted">{o.user.email}</p>
        </div>
      ),
    },
    { title: "Items", key: "items", render: (_, o) => o.items.length },
    {
      title: "Total",
      key: "total",
      render: (_, o) => currency.format(Number(o.totalPrice)),
    },
    {
      title: "Payment",
      key: "payment",
      render: (_, o) => o.payment?.status ?? "—",
    },
    {
      title: "Status",
      key: "status",
      filters: Object.keys(STATUS_COLORS).map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
      render: (_, o) => <Tag color={STATUS_COLORS[o.status]}>{o.status}</Tag>,
    },
    {
      title: "Placed",
      key: "createdAt",
      render: (_, o) => dateFmt.format(o.createdAt),
      sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={orders} pagination={{ pageSize: 10 }} />;
}
