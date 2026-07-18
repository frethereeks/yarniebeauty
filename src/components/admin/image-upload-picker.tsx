"use client";

import { useRef } from "react";
import Image from "next/image";

type PendingImage = { id: string; dataUrl: string };

export function ImageUploadPicker({
  pending,
  onAdd,
  onRemove,
}: {
  pending: PendingImage[];
  onAdd: (dataUrl: string) => void;
  onRemove: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = () => onAdd(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
        {pending.map((img) => (
          <div key={img.id} className="relative aspect-square bg-cream-soft overflow-hidden group">
            <Image src={img.dataUrl} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-ink text-cream text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square border border-dashed border-line flex items-center justify-center text-text-on-cream-muted text-sm hover:border-gold-deep transition-colors"
        >
          + Add
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <p className="text-xs text-text-on-cream-muted">Up to 4MB per image.</p>
    </div>
  );
}
