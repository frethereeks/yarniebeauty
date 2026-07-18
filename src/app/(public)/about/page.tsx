import { ASSET_URL } from "@/assets";
import { ThreadDivider } from "@/components/shared/thread-divider";
import Image from "next/image";

export const metadata = { title: "About — Yarniebeauty" };

const VALUES = [
  {
    title: "Hand-finished, always",
    body: "No factory lines. Every stitch in every piece passes through someone's hands before it reaches yours.",
  },
  {
    title: "Small batches, on purpose",
    body: "We'd rather sell out of a piece than overproduce it. What's listed is what's actually ready.",
  },
  {
    title: "The craft is meant to be shared",
    body: "We started teaching almost as early as we started selling — Yarniebeauty Academy exists because people kept asking how.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-cream py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-eyebrow text-gold-bright mb-5">Our story</p>
          <h1 className="text-display-xl mb-6">
            One hook, one skein,
            <br />
            <span className="italic text-gold-bright">one stitch at a time.</span>
          </h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24 grid md:grid-cols-3 gap-4 items-center">
        <aside className="relative aspect-4/5 bg-ink overflow-hidden">
          <Image src={ASSET_URL['file_oqef1k'].src} alt="file_oqef1k" className="absolute inset-0 flex items-center justify-center text-cream/40 text-sm text-center object-cover" fill />
        </aside>
        <aside className="max-w-3xl py-4 md:col-span-2">
          <p className="text-display-lg mb-4">About Yarnie Beauty</p>
          <p className="text-lg leading-relaxed text-text-on-cream-muted mb-6">
            Yarniebeauty began the way most good crafts do — quietly, and out of
            necessity. What started as making pieces for friends and family
            slowly turned into something people wanted to pay for, then into
            something people wanted to learn.
          </p>
          <p className="text-lg leading-relaxed text-text-on-cream-muted mb-6">
            Today, every yarn skein we sell has been hand-finished, and every
            crochet piece in the shop has gone through the same care and
            attention as the very first one we ever made. We haven't
            industrialized the process, and we don't plan to.
          </p>
          <p className="text-lg leading-relaxed text-text-on-cream-muted">
            The academy grew out of the same instinct — if people are going to
            ask how something is made, the most honest answer is to show them.
            Our cohorts walk new makers through the same techniques behind
            everything in the shop, whether they join us in person or online.
          </p>
        </aside>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <ThreadDivider variant="loop" animate={false} className="opacity-30" />
      </div>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <h2 className="text-display-lg mb-12 text-center">What we hold onto</h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {VALUES.map((v) => (
            <div key={v.title}>
              <h3 className="font-display text-xl text-gold-deep mb-3">{v.title}</h3>
              <p className="text-text-on-cream-muted leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
