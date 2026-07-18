import Link from "next/link";

export function ClosingCta() {
  return (
    <section className="py-24 sm:py-32 px-5 sm:px-8 text-center bg-cream">
      <p className="text-eyebrow text-gold-deep mb-5">Ready when you are</p>
      <h2 className="text-display-lg max-w-2xl mx-auto mb-9">
        Pick up a hook, or pick out a piece —
        <br />
        either way, we&apos;ll see you soon.
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center px-7 py-3.5 bg-ink text-cream text-eyebrow font-semibold hover:bg-charcoal transition-colors"
        >
          Shop the collection
        </Link>
        <Link
          href="/academy"
          className="inline-flex items-center px-7 py-3.5 border border-ink/30 text-ink text-eyebrow hover:border-gold-deep hover:text-gold-deep transition-colors"
        >
          Explore the academy
        </Link>
      </div>
    </section>
  );
}
