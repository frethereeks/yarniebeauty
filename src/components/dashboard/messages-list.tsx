"use client";

import { useState, useTransition } from "react";
import { markMessageRead } from "@/actions";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

type MessageItem = {
  id: string;
  readAt: Date | null;
  message: {
    subject: string;
    body: string;
    createdAt: Date;
    sender: { firstname: string; lastname: string };
  };
};

export function MessagesList({ messages }: { messages: MessageItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());

  function toggle(id: string, isUnread: boolean) {
    setOpenId(openId === id ? null : id);
    if (isUnread && !localRead.has(id)) {
      setLocalRead((prev) => new Set(prev).add(id));
      startTransition(async () => {
        await markMessageRead(id);
      });
    }
  }

  if (messages.length === 0) {
    return (
      <div className="border border-line border-dashed p-12 text-center text-text-on-cream-muted">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const isUnread = !m.readAt && !localRead.has(m.id);
        const open = openId === m.id;
        return (
          <div key={m.id} className="border border-line">
            <button
              onClick={() => toggle(m.id, isUnread)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                {isUnread && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                <div className="min-w-0">
                  <p className={`truncate ${isUnread ? "font-semibold" : "font-medium"}`}>{m.message.subject}</p>
                  <p className="text-xs text-text-on-cream-muted">
                    From {m.message.sender.firstname} {m.message.sender.lastname} ·{" "}
                    {dateFmt.format(m.message.createdAt)}
                  </p>
                </div>
              </div>
              <span className="text-text-on-cream-muted text-sm shrink-0">{open ? "−" : "+"}</span>
            </button>
            {open && (
              <div className="px-5 pb-5 text-sm text-text-on-cream-muted leading-relaxed whitespace-pre-line border-t border-line pt-4">
                {m.message.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
