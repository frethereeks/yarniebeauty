"use client";

import { useState, useTransition } from "react";
import { registerUser } from "@/actions";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      firstname: String(form.get("firstname") ?? ""),
      lastname: String(form.get("lastname") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    setFieldErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const result = await registerUser(input);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        setGeneralError(result.error);
      }
    });
  }

  if (submitted) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-display text-xl mb-2">Check your inbox</p>
        <p className="text-text-on-cream-muted leading-relaxed">
          We've sent a confirmation link to your email. Click it to activate
          your account, then come back to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" name="firstname" error={fieldErrors.firstname} required />
        <Field label="Last name" name="lastname" error={fieldErrors.lastname} required />
      </div>
      <Field label="Email" name="email" type="email" error={fieldErrors.email} required />
      <Field label="Phone" name="phone" type="tel" error={fieldErrors.phone} />
      <Field
        label="Password"
        name="password"
        type="password"
        error={fieldErrors.password}
        hint="At least 8 characters, with an uppercase letter and a number."
        required
      />

      {generalError && <p className="text-error text-sm">{generalError}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-cream text-eyebrow font-semibold py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  hint,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  hint?: string;
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
        required={required}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
      {hint && !error && <p className="text-xs text-text-on-cream-muted mt-1">{hint}</p>}
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
