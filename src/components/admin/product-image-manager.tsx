"use client";

import { useTransition } from "react";
import Image from "next/image";
import { App } from "antd";
import { deleteProductImage, setPrimaryProductImage } from "@/actions";

type ImageItem = { id: string; secureUrl: string; isPrimary: boolean };

export function ProductImageManager({ productId, images }: { productId: string; images: ImageItem[] }) {
  const [, startTransition] = useTransition();
  const { message, modal } = App.useApp();

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const result = await setPrimaryProductImage(productId, imageId);
      if (!result.ok) message.error(result.error);
    });
  }

  function handleDelete(imageId: string) {
    modal.confirm({
      title: "Remove this image?",
      content: "This will permanently delete the image.",
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await deleteProductImage(imageId);
            if (result.ok) resolve();
            else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  if (images.length === 0) {
    return <p className="text-sm text-text-on-cream-muted">No images yet.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {images.map((img) => (
        <div key={img.id} className="relative aspect-square bg-cream-soft overflow-hidden group">
          <Image src={img.secureUrl} alt="" fill sizes="120px" className="object-cover" />
          {img.isPrimary && (
            <span className="absolute top-1 left-1 bg-ink text-gold-bright text-[10px] px-1.5 py-0.5">
              Primary
            </span>
          )}
          <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
            {!img.isPrimary && (
              <button
                onClick={() => handleSetPrimary(img.id)}
                className="text-xs text-cream underline underline-offset-2"
              >
                Set as primary
              </button>
            )}
            <button onClick={() => handleDelete(img.id)} className="text-xs text-error underline underline-offset-2 bg-cream px-2 py-0.5">
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
