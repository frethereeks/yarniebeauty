"use client";

import { useState, useTransition } from "react";
import { checkoutEnrolment } from "@/actions";

export function EnrolmentCheckout({ enrolmentId }: { enrolmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  function handlePay() {
    setError(null);
    setStarted(true);
    startTransition(async () => {
      const result = await checkoutEnrolment(enrolmentId);
      if (result.ok && result.data) {
        window.location.href = result.data.authorizationUrl;
      } else if (!result.ok) {
        setError(result.error);
        setStarted(false);
      }
    });
  }

  return (
    <div className="text-center">
      {error && <p className="text-error text-sm mb-5">{error}</p>}
      <button
        type="button"
        onClick={handlePay}
        disabled={isPending}
        className="inline-flex items-center px-8 py-3.5 bg-gold text-ink text-eyebrow font-semibold hover:bg-gold-bright transition-colors disabled:opacity-60"
      >
        {isPending || started ? "Redirecting to payment…" : "Pay with Paystack"}
      </button>
    </div>
  );
}
