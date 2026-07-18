"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(token, password);
      if (result.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-display text-xl mb-2">Password updated</p>
        <p className="text-text-on-cream-muted">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-cream text-eyebrow font-semibold py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
