"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, Input, App } from "antd";
import { updateOrderStatus } from "@/actions";

const ALL_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "OutForDelivery",
  "Delivered",
  "Returned",
  "Cancelled",
] as const;

const NEXT_STATUS: Record<string, string> = {
  Pending: "Confirmed",
  Confirmed: "Processing",
  Processing: "OutForDelivery",
  OutForDelivery: "Delivered",
};

export function OrderStatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [selected, setSelected] = useState<string>(currentStatus);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const { modal, message } = App.useApp();
  const router = useRouter();

  function handleApply() {
    if (selected === currentStatus) return;

    modal.confirm({
      title: `Change status to "${selected}"?`,
      content: `This will update the order and email the customer to let them know their order is now ${selected}.`,
      okText: "Confirm change",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await updateOrderStatus(
              orderId,
              selected as typeof ALL_STATUSES[number],
              note.trim() || undefined
            );
            if (result.ok) {
              message.success("Status updated and customer notified");
              setNote("");
              router.refresh();
              resolve();
            } else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  const suggestedNext = NEXT_STATUS[currentStatus];

  return (
    <div className="border border-line p-6">
      <h2 className="text-eyebrow text-text-on-cream-muted mb-4">Update status</h2>
      <div className="space-y-4">
        <Select
          className="w-full"
          size="large"
          value={selected}
          onChange={setSelected}
          options={ALL_STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <Input.TextArea
          placeholder="Optional note for the customer (e.g. tracking info)"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          onClick={handleApply}
          disabled={isPending || selected === currentStatus}
          className="w-full bg-ink text-cream text-eyebrow font-semibold py-3 hover:bg-charcoal transition-colors disabled:opacity-50"
        >
          {isPending ? "Updating…" : "Apply status change"}
        </button>
        {suggestedNext && selected === currentStatus && (
          <p className="text-xs text-text-on-cream-muted">
            Typical next step:{" "}
            <button onClick={() => setSelected(suggestedNext)} className="underline">
              {suggestedNext}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
