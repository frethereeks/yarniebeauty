"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Table, Tag, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { deleteCohort } from "@/actions";

type CohortRow = {
  id: string;
  title: string;
  price: number | string;
  startDate: Date;
  endDate: Date;
  status: string;
  modePolicy: string;
  _count: { enrolments: number };
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLORS: Record<string, string> = {
  Upcoming: "blue",
  Ongoing: "gold",
  Completed: "green",
  Cancelled: "red",
};

export function CohortsTable({ cohorts }: { cohorts: CohortRow[] }) {
  const [, startTransition] = useTransition();
  const { modal, message } = App.useApp();

  function handleDelete(id: string, title: string) {
    modal.confirm({
      title: "Delete this cohort?",
      content: `"${title}" will be permanently removed. Cohorts with enrolled students can't be deleted — cancel them instead.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await deleteCohort(id);
            if (result.ok) {
              message.success("Cohort deleted");
              resolve();
            } else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  const columns: ColumnsType<CohortRow> = [
    {
      title: "Title",
      key: "title",
      render: (_, c) => (
        <Link href={`/admin/academy/${c.id}`} className="font-medium hover:text-gold-deep">
          {c.title}
        </Link>
      ),
    },
    { title: "Mode", dataIndex: "modePolicy", key: "modePolicy" },
    {
      title: "Dates",
      key: "dates",
      render: (_, c) => <p className="whitespace-nowrap">`${dateFmt.format(c.startDate)} – ${dateFmt.format(c.endDate)}`</p>,
    },
    { title: "Price", key: "price", render: (_, c) => currency.format(Number(c.price)) },
    { title: "Enrolled", key: "enrolled", render: (_, c) => c._count.enrolments },
    {
      title: "Status",
      key: "status",
      render: (_, c) => <Tag color={STATUS_COLORS[c.status]}>{c.status}</Tag>,
    },
    {
      title: "",
      key: "actions",
      render: (_, c) => (
        <button onClick={() => handleDelete(c.id, c.title)} className="text-xs text-error hover:underline">
          Delete
        </button>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={cohorts} style={{minWidth: 350}} pagination={{ pageSize: 10 }} />;
}
