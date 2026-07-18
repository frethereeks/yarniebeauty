import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  popular?: boolean;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function ProductCard({ slug, name, price, imageUrl, popular }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-cream-soft overflow-hidden mb-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover product-card-image"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-on-cream-muted text-sm">
            No image yet
          </div>
        )}
        {popular && (
          <span className="absolute top-3 left-3 bg-ink text-gold-bright text-eyebrow px-3 py-1.5">
            Popular
          </span>
        )}
      </div>
      <h3 className="font-display text-lg text-text-on-cream group-hover:text-gold-deep transition-colors">
        {name}
      </h3>
      <p className="text-sm text-text-on-cream-muted mt-1">{currency.format(price)}</p>
    </Link>
  );
}
