"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Table, Switch, Tag, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { toggleProductAvailability, deleteProduct } from "@/actions";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  qtyAvailable: number;
  status: string;
  popular: boolean;
  category: { name: string };
  images: { secureUrl: string; isPrimary: boolean }[];
};

const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [, startTransition] = useTransition();
  const { message, modal } = App.useApp();

  function handleToggle(id: string) {
    startTransition(async () => {
      const result = await toggleProductAvailability(id);
      if (!result.ok) message.error(result.error);
    });
  }

  function handleDelete(id: string, name: string) {
    modal.confirm({
      title: "Delete this product?",
      content: `"${name}" and its images will be permanently removed. This can't be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await deleteProduct(id);
            if (result.ok) {
              message.success("Product deleted");
              resolve();
            } else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  const columns: ColumnsType<ProductRow> = [
    {
      title: "",
      key: "image",
      width: 56,
      render: (_, p) => {
        const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
        return (
          <div className="relative w-10 h-12 bg-cream-soft overflow-hidden">
            {primary && <Image src={primary.secureUrl} alt="" fill sizes="40px" className="object-cover" />}
          </div>
        );
      },
    },
    {
      title: "Name",
      key: "name",
      render: (_, p) => (
        <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-gold-deep">
          {p.name}
        </Link>
      ),
    },
    { title: "Category", dataIndex: ["category", "name"], key: "category" },
    {
      title: "Price",
      key: "price",
      render: (_, p) => currency.format(Number(p.price)),
    },
    { title: "Stock", dataIndex: "qtyAvailable", key: "qty" },
    {
      title: "Popular",
      key: "popular",
      render: (_, p) => (p.popular ? <Tag color="gold">Popular</Tag> : null),
    },
    {
      title: "Available",
      key: "status",
      render: (_, p) => (
        <Switch checked={p.status === "Available"} onChange={() => handleToggle(p.id)} />
      ),
    },
    {
      title: "",
      key: "actions",
      render: (_, p) => (
        <button
          onClick={() => handleDelete(p.id, p.name)}
          className="text-xs text-error hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={products} style={{minWidth: 350}} pagination={{ pageSize: 10 }} />;
}
