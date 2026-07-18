"use client";

import { useTransition } from "react";
import { App } from "antd";
import { markContactMessageRead, deleteContactMessage } from "@/actions";

type ContactRow = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: Date;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function ContactMessagesList({ messages }: { messages: ContactRow[] }) {
  const [, startTransition] = useTransition();
  const { message: toast, modal } = App.useApp();

  function handleRead(id: string) {
    startTransition(async () => {
      await markContactMessageRead(id);
    });
  }

  function handleDelete(id: string) {
    modal.confirm({
      title: "Delete this message?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await deleteContactMessage(id);
            if (result.ok) {
              toast.success("Message deleted");
              resolve();
            } else {
              toast.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  if (messages.length === 0) {
    return <p className="text-text-on-cream-muted text-sm p-6">No contact messages.</p>;
  }

  return (
    <div className="divide-y divide-line">
      {messages.map((m) => (
        <div
          key={m.id}
          onClick={() => m.status === "Unread" && handleRead(m.id)}
          className={`p-5 ${m.status === "Unread" ? "bg-amber-100" : "bg-amber-50"}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium text-sm">{m.fullname}</p>
              <p className="text-xs text-text-on-cream-muted">
                {m.email} · {m.phone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-on-cream-muted">{dateFmt.format(m.createdAt)}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(m.id);
                }}
                className="text-xs text-error hover:underline mt-1"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-text-on-cream-muted">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
