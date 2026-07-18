import { ASSET_URL } from "@/assets";
import Image from "next/image";
import Link from "next/link";

export function AboutTeaser() {
  return (
    <section className="bg-cream-soft">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative aspect-4/5 bg-ink overflow-hidden order-2 lg:order-1">
          {/* Editorial portrait placeholder — swap for real workshop photography */}
          {/* <div className="absolute inset-0 flex items-center justify-center text-cream/40 text-sm px-8 text-center">
            Workshop photography goes here
          </div> */}
          <Image src={ASSET_URL['file_oqef1k'].src} alt="file_oqef1k" className="absolute inset-0 flex items-center justify-center text-cream/40 text-sm text-center" fill />
          
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-eyebrow text-gold-deep mb-4">Our story</p>
          <h2 className="text-display-lg mb-6">
            A craft passed down,
            <br />
            now made to order.
          </h2>
          <p className="text-text-on-cream-muted leading-relaxed mb-5 max-w-md">
            Yarniebeauty began as one woman&apos;s hook and a single skein of
            yarn. Today, every piece is still finished by hand — and every
            stitch is one we&apos;re happy to teach.
          </p>
          <p className="text-text-on-cream-muted leading-relaxed mb-8 max-w-md">
            No factory lines, no shortcuts. Just patient, deliberate
            craftsmanship — and a growing community of makers we&apos;ve
            trained ourselves.
          </p>
          <Link
            href="/about"
            className="text-eyebrow text-gold-deep hover:text-ink underline underline-offset-4"
          >
            Read our full story →
          </Link>
        </div>
      </div>
    </section>
  );
}
