import Link from "next/link";
import { ProductCard } from "@/components/public/product-card";
import { ThreadDivider } from "@/components/shared/thread-divider";

type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  popular: boolean;
  images: { secureUrl: string; isPrimary: boolean }[];
};

export function FeaturedProducts({ products }: { products: FeaturedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="text-eyebrow text-gold-deep mb-3">From the workshop</p>
          <h2 className="text-display-lg">Recently finished</h2>
        </div>
        <Link
          href="/products"
          className="text-eyebrow text-gold-deep hover:text-ink underline underline-offset-4"
        >
          View all products →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((p) => {
          const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
          return (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={Number(p.price)}
              imageUrl={primary?.secureUrl}
              popular={p.popular}
            />
          );
        })}
      </div>

      <div className="mt-16">
        <ThreadDivider variant="wave" animate={false} className="opacity-30" />
      </div>
    </section>
  );
}
