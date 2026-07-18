import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/actions";
import { auth } from "@/lib/auth";
import { AddToCartForm } from "@/components/public/add-to-cart-form";
import { ThreadDivider } from "@/components/shared/thread-divider";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProductBySlug(slug), auth()]);

  if (!product || product.status !== "Available") {
    notFound();
  }

  const images = product.images.length > 0 ? product.images : [];
  const primary = images.find((i) => i.isPrimary) ?? images[0];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] bg-cream-soft mb-4 overflow-hidden">
            {primary ? (
              <Image
                src={primary.secureUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-on-cream-muted text-sm">
                No image yet
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square bg-cream-soft overflow-hidden">
                  <Image
                    src={img.secureUrl}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-eyebrow text-gold-deep mb-3">{product.category.name}</p>
          <h1 className="text-display-lg mb-4">{product.name}</h1>
          <p className="text-2xl font-display text-gold-deep mb-8">
            {currency.format(Number(product.price))}
          </p>

          <div className="mb-8">
            <ThreadDivider variant="straight" animate={false} className="opacity-30" />
          </div>

          {product.description && (
            <div className="text-text-on-cream-muted leading-relaxed mb-9 whitespace-pre-line">
              {product.description}
            </div>
          )}

          <AddToCartForm
            productId={product.id}
            qtyAvailable={product.qtyAvailable}
            isAuthenticated={!!session?.user}
          />

          <p className="text-xs text-text-on-cream-muted mt-5">
            {product.qtyAvailable > 0
              ? `${product.qtyAvailable} in stock — finished by hand, so quantities are limited.`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
