"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginWithCredentials, resendConfirmationEmail } from "@/actions";

export function LoginForm({ nextUrl }: { nextUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [email, setEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const emailVal = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setEmail(emailVal);
    setError(null);
    setShowResend(false);

    startTransition(async () => {
      const result = await loginWithCredentials({ email: emailVal, password });
      if (result.ok) {
        router.push(nextUrl);
        router.refresh();
      } else {
        setError(result.error);
        if (result.error.includes("confirm your email")) {
          setShowResend(true);
        }
      }
    });
  }

  function handleResend() {
    startTransition(async () => {
      await resendConfirmationEmail(email);
      setResendSent(true);
    });
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
          placeholder="mondaysalis@email.com"
          required
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-eyebrow text-text-on-cream-muted" htmlFor="password">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-gold-deep underline underline-offset-2">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="*********"
          minLength={6}
          required
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>

      {error && (
        <div className="text-error text-sm">
          {error}
          {showResend && (
            <button
              type="button"
              onClick={handleResend}
              disabled={isPending || resendSent}
              className="block mt-2 underline underline-offset-2 text-gold-deep disabled:opacity-60"
            >
              {resendSent ? "Confirmation link sent — check your inbox" : "Resend confirmation email"}
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-cream text-eyebrow font-semibold py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
