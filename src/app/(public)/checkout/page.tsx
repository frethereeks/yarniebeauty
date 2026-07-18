import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getCart } from "@/actions";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/public/checkout-form";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export const metadata = { title: "Checkout — Yarniebeauty" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/checkout");
  }

  const [cart, user] = await Promise.all([
    getCart(),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <h1 className="text-display-lg mb-12">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-eyebrow text-gold-deep mb-5">Delivery details</h2>
          <CheckoutForm
            prefill={{
              fullname: `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim(),
              email: user?.email ?? "",
              phone: user?.phone ?? "",
              address: user?.defaultAddress ?? "",
              city: user?.defaultCity ?? "",
              state: user?.defaultState ?? "",
            }}
          />
        </div>

        <div className="border border-line p-7 h-fit">
          <h2 className="font-display text-xl mb-5">Order summary</h2>
          <div className="divide-y divide-line mb-5">
            {cart.items.map((item) => {
              const primary = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
              return (
                <div key={item.id} className="flex gap-4 py-3">
                  <div className="relative w-14 h-16 bg-cream-soft flex-shrink-0 overflow-hidden">
                    {primary && (
                      <Image src={primary.secureUrl} alt={item.product.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-text-on-cream-muted">
                      {item.quantity} × {currency.format(Number(item.product.price))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between font-semibold text-lg pt-3 border-t border-line">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
          <p className="text-xs text-text-on-cream-muted mt-4">
            You'll be redirected to Paystack to complete payment securely.
          </p>
        </div>
      </div>
    </div>
  );
}
