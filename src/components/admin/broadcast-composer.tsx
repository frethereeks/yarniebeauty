"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, Input, App } from "antd";
import { sendBroadcast } from "@/actions";

export function BroadcastComposer() {
  const [audience, setAudience] = useState<"ALL" | "CUSTOMERS" | "STUDENTS">("ALL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { modal, message } = App.useApp();
  const router = useRouter();

  const audienceLabel = { ALL: "all active members", CUSTOMERS: "customers", STUDENTS: "students" }[audience];

  function handleSend() {
    setError(null);
    if (subject.trim().length < 2 || body.trim().length < 5) {
      setError("Please write a subject and message.");
      return;
    }

    modal.confirm({
      title: `Send this to ${audienceLabel}?`,
      content: "This will email everyone in the selected audience and add the message to their inbox. This can't be undone.",
      okText: "Send broadcast",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await sendBroadcast({ audience, subject: subject.trim(), body: body.trim() });
            if (result.ok) {
              message.success(`Sent to ${result.data?.recipientCount} recipient(s)`);
              setSubject("");
              setBody("");
              router.refresh();
              resolve();
            } else {
              setError(result.error);
              reject();
            }
          });
        }),
    });
  }

  return (
    <div className="border border-line bg-white p-7 max-w-xl">
      <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Compose broadcast</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Audience</label>
          <Select
            size="large"
            className="w-full"
            value={audience}
            onChange={setAudience}
            options={[
              { value: "ALL", label: "All active members" },
              { value: "CUSTOMERS", label: "Customers only" },
              { value: "STUDENTS", label: "Students only" },
            ]}
          />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Subject</label>
          <Input size="large" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Message</label>
          <Input.TextArea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button
          onClick={handleSend}
          disabled={isPending}
          className="bg-gold text-ink text-eyebrow font-semibold px-7 py-3.5 hover:bg-gold-bright transition-colors disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send broadcast"}
        </button>
      </div>
    </div>
  );
}
