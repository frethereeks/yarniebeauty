"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { App } from "antd";
import { updateCartItemQuantity, removeFromCart } from "@/actions";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

type CartItemData = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    qtyAvailable: number;
    images: { secureUrl: string; isPrimary: boolean }[];
  };
};

export function CartView({ items }: { items: CartItemData[] }) {
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  function changeQty(itemId: string, qty: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(itemId, qty);
      if (!result.ok) message.error(result.error);
    });
  }

  function remove(itemId: string) {
    startTransition(async () => {
      const result = await removeFromCart(itemId);
      if (!result.ok) message.error(result.error);
      else message.success("Removed from cart");
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-text-on-cream-muted text-lg mb-6">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center px-7 py-3.5 bg-ink text-cream text-eyebrow font-semibold hover:bg-charcoal transition-colors"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 divide-y divide-line">
        {items.map((item) => {
          const primary = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
          return (
            <div key={item.id} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 bg-cream-soft flex-shrink-0 overflow-hidden">
                {primary && (
                  <Image src={primary.secureUrl} alt={item.product.name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/products/${item.product.slug}`} className="font-display text-lg hover:text-gold-deep">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-text-on-cream-muted mt-1">
                    {currency.format(Number(item.product.price))}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      disabled={isPending}
                      onClick={() => changeQty(item.id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-cream-soft"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      disabled={isPending || item.quantity >= item.product.qtyAvailable}
                      onClick={() => changeQty(item.id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-cream-soft disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    disabled={isPending}
                    onClick={() => remove(item.id)}
                    className="text-xs text-text-on-cream-muted hover:text-error underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-line p-7 h-fit">
        <h2 className="font-display text-xl mb-5">Order summary</h2>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-text-on-cream-muted">Subtotal</span>
          <span>{currency.format(total)}</span>
        </div>
        <p className="text-xs text-text-on-cream-muted mb-6">
          Delivery details are confirmed at checkout.
        </p>
        <Link
          href="/checkout"
          className="block text-center w-full bg-gold text-ink text-eyebrow font-semibold py-3.5 hover:bg-gold-bright transition-colors"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
