"use client";

import { useTransition } from "react";
import { Table, Tag, Select, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { adminUpdateEnrolmentStatus } from "@/actions";

type EnrolmentRow = {
  id: string;
  mode: string;
  status: string;
  price: number | string;
  createdAt: Date;
  user: { firstname: string; lastname: string; email: string };
  payment: { status: string } | null;
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS: Record<string, string> = {
  AwaitingPayment: "orange",
  Active: "gold",
  Completed: "green",
  Withdrawn: "red",
};

export function EnrolledStudentsTable({ enrolments }: { enrolments: EnrolmentRow[] }) {
  const [, startTransition] = useTransition();
  const { message } = App.useApp();

  function handleStatusChange(id: string, status: "Active" | "Completed" | "Withdrawn") {
    startTransition(async () => {
      const result = await adminUpdateEnrolmentStatus(id, status);
      if (!result.ok) message.error(result.error);
      else message.success("Enrolment updated");
    });
  }

  const columns: ColumnsType<EnrolmentRow> = [
    {
      title: "Student",
      key: "student",
      render: (_, e) => (
        <div>
          <p className="text-sm font-medium">{e.user.firstname} {e.user.lastname}</p>
          <p className="text-xs text-text-on-cream-muted">{e.user.email}</p>
        </div>
      ),
    },
    { title: "Mode", dataIndex: "mode", key: "mode" },
    { title: "Paid", key: "price", render: (_, e) => currency.format(Number(e.price)) },
    { title: "Payment", key: "payment", render: (_, e) => e.payment?.status ?? "—" },
    { title: "Enrolled", key: "createdAt", render: (_, e) => dateFmt.format(e.createdAt) },
    {
      title: "Status",
      key: "status",
      render: (_, e) =>
        e.status === "AwaitingPayment" ? (
          <Tag color={STATUS_COLORS[e.status]}>{e.status}</Tag>
        ) : (
          <Select
            size="small"
            value={e.status}
            style={{ width: 130 }}
            onChange={(val) => handleStatusChange(e.id, val as ("Active" | "Completed" | "Withdrawn"))}
            options={[
              { value: "Active", label: "Active" },
              { value: "Completed", label: "Completed" },
              { value: "Withdrawn", label: "Withdrawn" },
            ]}
          />
        ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={enrolments} pagination={{ pageSize: 10 }} />;
}
