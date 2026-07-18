"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { createCategory } from "@/actions";

export function QuickAddCategory() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();
  const router = useRouter();

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCategory(name);
      if (result.ok) {
        message.success("Category created");
        setName("");
        setOpen(false);
        router.refresh();
      } else {
        message.error(result.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-gold-deep underline underline-offset-2"
      >
        + Add a new category
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border border-line px-3 py-1.5 text-sm flex-1"
      />
      <button
        type="submit"
        disabled={isPending || name.trim().length < 2}
        className="text-xs bg-ink text-cream px-3 py-1.5 disabled:opacity-50"
      >
        Add
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-on-cream-muted">
        Cancel
      </button>
    </form>
  );
}
