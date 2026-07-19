"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { Input, InputNumber, Select, DatePicker, App } from "antd";
import { createCohort, updateCohort } from "@/actions";

type CohortFormValues = {
  title: string;
  description: string;
  price: number;
  startDate: string | Date;
  endDate: string | Date;
  duration: string;
  modePolicy: "PhysicalOnly" | "OnlineOnly" | "StudentChoice";
  capacity: number | null;
};

export function CohortForm({
  initial,
  cohortId,
  existingImageUrl,
}: {
  initial?: CohortFormValues;
  cohortId?: string;
  existingImageUrl?: string | null;
}) {
  const [values, setValues] = useState<CohortFormValues>(
    initial ?? {
      title: "",
      description: "",
      price: 0,
      startDate: "",
      endDate: "",
      duration: "",
      modePolicy: "StudentChoice",
      capacity: null,
    }
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message } = App.useApp();
  const router = useRouter();

  const isEdit = !!cohortId;

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.startDate || !values.endDate || !values.duration.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      const dataValues = {...values, startDate: values.startDate as Date, endDate: values.endDate as Date}
      const result = isEdit
        ? await updateCohort(cohortId!, dataValues, imageDataUrl ?? undefined)
        : await createCohort(dataValues, imageDataUrl ?? undefined);

      if (result.ok) {
        message.success(isEdit ? "Cohort updated" : "Cohort created");
        router.push("/admin/academy");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2">Title</label>
        <Input size="large" value={values.title} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} />
      </div>

      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-2">Description</label>
        <Input.TextArea
          rows={5}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="What will students learn in this cohort?"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Start date</label>
          <DatePicker
            size="large"
            className="w-full"
            value={values.startDate ? dayjs(values.startDate) : null}
            onChange={(date) => setValues((v) => ({ ...v, startDate: date ? date.toISOString() : "" }))}
          />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">End date</label>
          <DatePicker
            size="large"
            className="w-full"
            value={values.endDate ? dayjs(values.endDate) : null}
            onChange={(date) => setValues((v) => ({ ...v, endDate: date ? date.toISOString() : "" }))}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Duration label</label>
          <Input
            size="large"
            placeholder="e.g. 6 weeks"
            value={values.duration}
            onChange={(e) => setValues((v) => ({ ...v, duration: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Price (NGN)</label>
          <InputNumber
            size="large"
            className="w-full"
            min={0}
            value={values.price}
            onChange={(val) => setValues((v) => ({ ...v, price: val ?? 0 }))}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Study mode</label>
          <Select
            size="large"
            className="w-full"
            value={values.modePolicy}
            onChange={(val) => setValues((v) => ({ ...v, modePolicy: val }))}
            options={[
              { value: "PhysicalOnly", label: "In-person only" },
              { value: "OnlineOnly", label: "Online only" },
              { value: "StudentChoice", label: "Student's choice" },
            ]}
          />
        </div>
        <div>
          <label className="block text-eyebrow text-text-on-cream-muted mb-2">Capacity (optional)</label>
          <InputNumber
            size="large"
            className="w-full"
            min={1}
            placeholder="Unlimited"
            value={values.capacity ?? undefined}
            onChange={(val) => setValues((v) => ({ ...v, capacity: val ?? null }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-eyebrow text-text-on-cream-muted mb-3">Cohort image</label>
        {(imageDataUrl || existingImageUrl) && (
          <div className="relative w-32 aspect-[4/3] bg-cream-soft overflow-hidden mb-3">
            <Image src={imageDataUrl ?? existingImageUrl!} alt="" fill sizes="128px" className="object-cover" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-gold-deep underline underline-offset-2"
        >
          {existingImageUrl ? "Replace image" : "Upload image"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-ink text-cream text-eyebrow font-semibold px-7 py-3.5 hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Saving…" : isEdit ? "Save changes" : "Create cohort"}
      </button>
    </form>
  );
}
