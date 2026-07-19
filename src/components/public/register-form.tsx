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
      firstname: String(form.get("firstname") ?? "") as string,
      lastname: String(form.get("lastname") ?? "") as string,
      email: String(form.get("email") ?? "") as string,
      phone: String(form.get("phone") ?? "") as string,
      password: String(form.get("password") ?? "") as string,
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
      <div className="grid gap-4">
        <Field label="First name" placeholder="Damilola" name="firstname" error={fieldErrors.firstname} required />
        <Field label="Last name" placeholder="Okoli" name="lastname" error={fieldErrors.lastname} required />
      </div>
      <Field label="Email" placeholder="damikolie@email.com" name="email" type="email" error={fieldErrors.email} required />
      <Field label="Phone" placeholder="08038262892" minLength={11} maxLength={11} name="phone" type="tel" error={fieldErrors.phone} />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="*********"
        minLength={6}
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
  placeholder,
  type = "text",
  error,
  hint,
  required,
  maxLength = 1000,
  minLength = 0,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number 
  minLength?: number 
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
        minLength={minLength ? minLength : required ? 1 : 0}
        maxLength={maxLength ?? 1000}
        placeholder={placeholder ?? ""}
        required={required}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
      {hint && !error && <p className="text-xs text-text-on-cream-muted mt-1">{hint}</p>}
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
