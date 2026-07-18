"use client";

import { useState, useTransition } from "react";
import { App } from "antd";
import { changePassword } from "@/actions";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const current = String(form.get("current") ?? "");
    const next = String(form.get("next") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    setError(null);

    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword(current, next);
      if (result.ok) {
        message.success("Password updated");
        e.currentTarget?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <Field label="Current password" name="current" />
      <Field label="New password" name="next" />
      <Field label="Confirm new password" name="confirm" />
      {error && <p className="text-error text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-cream text-eyebrow font-semibold px-6 py-3 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function Field({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="password"
        required
        minLength={8}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
    </div>
  );
}
