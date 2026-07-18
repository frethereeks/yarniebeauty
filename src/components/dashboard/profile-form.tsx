"use client";

import { useState, useTransition } from "react";
import { App } from "antd";
import { updateProfile } from "@/actions";

type ProfileData = {
  firstname: string;
  lastname: string;
  phone: string;
  defaultAddress: string;
  defaultCity: string;
  defaultState: string;
};

export function ProfileForm({ initial }: { initial: ProfileData }) {
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const input = {
      firstname: String(form.get("firstname") ?? ""),
      lastname: String(form.get("lastname") ?? ""),
      phone: String(form.get("phone") ?? ""),
      defaultAddress: String(form.get("defaultAddress") ?? ""),
      defaultCity: String(form.get("defaultCity") ?? ""),
      defaultState: String(form.get("defaultState") ?? ""),
    };

    startTransition(async () => {
      const result = await updateProfile(input);
      if (result.ok) message.success("Profile updated");
      else message.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name" name="firstname" defaultValue={initial.firstname} required />
        <Field label="Last name" name="lastname" defaultValue={initial.lastname} required />
      </div>
      <Field label="Phone" name="phone" type="tel" defaultValue={initial.phone} />
      <Field label="Default delivery address" name="defaultAddress" defaultValue={initial.defaultAddress} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="City" name="defaultCity" defaultValue={initial.defaultCity} />
        <Field label="State" name="defaultState" defaultValue={initial.defaultState} />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-cream text-eyebrow font-semibold px-6 py-3 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
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
    </div>
  );
}
