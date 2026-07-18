import { getAllProducts, getActiveCategories } from "@/actions";
import { ProductCard } from "@/components/public/product-card";

export const metadata = { title: "Shop — Yarniebeauty" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getAllProducts({ categorySlug: params.category, search: params.q }),
    getActiveCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-eyebrow text-gold-deep mb-3">The collection</p>
        <h1 className="text-display-lg mb-4">Shop handmade yarn &amp; crochet</h1>
        <p className="text-text-on-cream-muted">
          Every piece is finished by hand in small batches. What you see is
          what's currently in stock — nothing is mass-produced.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        <a
          href="/products"
          className={`px-4 py-2 text-sm border transition-colors ${
            !params.category
              ? "bg-ink text-cream border-ink"
              : "border-line text-text-on-cream-muted hover:border-gold-deep"
          }`}
        >
          All
        </a>
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`px-4 py-2 text-sm border transition-colors ${
              params.category === c.slug
                ? "bg-ink text-cream border-ink"
                : "border-line text-text-on-cream-muted hover:border-gold-deep"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-text-on-cream-muted text-lg mb-2">Nothing here yet.</p>
          <p className="text-text-on-cream-muted text-sm">
            New pieces are added as they're finished — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
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
      )}
    </div>
  );
}
