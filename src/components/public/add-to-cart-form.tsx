"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { addToCart } from "@/actions";

export function AddToCartForm({
  productId,
  qtyAvailable,
  isAuthenticated,
}: {
  productId: string;
  qtyAvailable: number;
  isAuthenticated: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { message } = App.useApp();

  const outOfStock = qtyAvailable <= 0;

  function handleAdd() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.ok) {
        message.success("Added to your cart");
      } else {
        message.error(result.error);
      }
    });
  }

  if (outOfStock) {
    return (
      <div className="border border-line px-5 py-4 text-text-on-cream-muted text-sm">
        Currently out of stock. Check back soon — every piece sells in small batches.
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex items-center border border-line">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-11 h-12 flex items-center justify-center text-lg hover:bg-cream-soft transition-colors"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center font-medium" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(qtyAvailable, q + 1))}
          className="w-11 h-12 flex items-center justify-center text-lg hover:bg-cream-soft transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending}
        className="flex-1 bg-ink text-cream text-eyebrow font-semibold hover:bg-charcoal transition-colors disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
