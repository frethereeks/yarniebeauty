"use client";

import { useState, useTransition } from "react";
import { checkoutOrder } from "@/actions";

type PrefillData = {
  fullname: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
};

export function CheckoutForm({ prefill }: { prefill: PrefillData }) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      fullname: String(form.get("fullname") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    setFieldErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const result = await checkoutOrder(input);
      if (result.ok && result.data) {
        window.location.href = result.data.authorizationUrl;
      } else if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setGeneralError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" name="fullname" defaultValue={prefill.fullname} error={fieldErrors.fullname} required />
        <Field label="Email" name="email" type="email" defaultValue={prefill.email} error={fieldErrors.email} required />
      </div>
      <Field label="Phone" name="phone" type="tel" defaultValue={prefill.phone} error={fieldErrors.phone} required />
      <Field label="Delivery address" name="address" defaultValue={prefill.address} error={fieldErrors.address} required />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City" name="city" defaultValue={prefill.city} error={fieldErrors.city} required />
        <Field label="State" name="state" defaultValue={prefill.state} error={fieldErrors.state} required />
      </div>
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor="notes">
          Delivery notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Landmark, gate code, preferred delivery time…"
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
      </div>

      {generalError && <p className="text-error text-sm">{generalError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gold text-ink text-eyebrow font-semibold py-3.5 hover:bg-gold-bright transition-colors disabled:opacity-60"
      >
        {isPending ? "Redirecting to payment…" : "Continue to payment"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
