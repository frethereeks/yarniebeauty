"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { App } from "antd";
import { uploadAvatar } from "@/actions";

export function AvatarUpload({ initialUrl, initials }: { initialUrl?: string | null; initials: string }) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message } = App.useApp();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      message.error("Please choose an image under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      startTransition(async () => {
        const result = await uploadAvatar(dataUrl);
        if (result.ok && result.data) {
          setPreview(result.data.url);
          message.success("Photo updated");
        } else if (!result.ok) {
          message.error(result.error);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-20 h-20 rounded-full bg-cream-soft overflow-hidden flex items-center justify-center text-xl font-display text-gold-deep">
        {preview ? (
          <Image src={preview} alt="Profile photo" fill sizes="80px" className="object-cover" />
        ) : (
          initials
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="text-sm text-gold-deep underline underline-offset-2 disabled:opacity-60"
        >
          {isPending ? "Uploading…" : "Change photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
