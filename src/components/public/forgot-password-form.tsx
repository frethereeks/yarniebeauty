"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");

    startTransition(async () => {
      await requestPasswordReset(email);
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-display text-xl mb-2">Check your inbox</p>
        <p className="text-text-on-cream-muted">
          If an account exists with that email, we&apos;ve sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-cream text-eyebrow font-semibold py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
