"use client";

import { useState, useTransition } from "react";
import { App } from "antd";
import { submitContactForm } from "@/actions";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const { message } = App.useApp();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      fullname: String(form.get("fullname") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    setFieldErrors({});
    startTransition(async () => {
      const result = await submitContactForm(input);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setFieldErrors(result.fieldErrors ?? {});
        message.error(result.error);
      }
    });
  }

  if (submitted) {
    return (
      <div className="border border-line p-8 text-center">
        <p className="font-display text-xl mb-2">Message sent</p>
        <p className="text-text-on-cream-muted">
          Thanks for reaching out — we'll get back to you within a day or two.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Full name" name="fullname" error={fieldErrors.fullname} required />
      <Field label="Email" name="email" type="email" error={fieldErrors.email} required />
      <Field label="Phone" name="phone" type="tel" error={fieldErrors.phone} required />
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
        />
        {fieldErrors.message && <p className="text-error text-sm mt-1">{fieldErrors.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-cream text-eyebrow font-semibold py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
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
        required={required}
        className="w-full border border-line px-4 py-3 bg-white focus-visible:outline-none focus-visible:border-gold-deep"
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}
