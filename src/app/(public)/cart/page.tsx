import { getCart } from "@/actions";
import { CartView } from "@/components/public/cart-view";

export const metadata = { title: "Your cart — Yarniebeauty" };

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <h1 className="text-display-lg mb-12">Your cart</h1>
      <CartView items={cart?.items ?? []} />
    </div>
  );
}
