import Link from "next/link";
import { getOpenCohorts } from "@/actions";
import { ThreadDivider } from "@/components/shared/thread-divider";
import Image from "next/image";
import { ASSET_URL } from "@/assets";

export const metadata = { title: "Academy — Yarniebeauty" };

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function modeLabel(policy: string) {
  if (policy === "PhysicalOnly") return "In-person only";
  if (policy === "OnlineOnly") return "Online only";
  return "Online or in-person";
}

export default async function AcademyPage() {
  const cohorts = await getOpenCohorts();

  return (
    <div>
      <section className="bg-ink text-cream py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-eyebrow text-gold-bright mb-5">Yarniebeauty Academy</p>
          <h1 className="text-display-xl mb-6">Learn to crochet, properly.</h1>
          <p className="text-cream/75 text-lg max-w-xl mx-auto">
            Small cohorts, real feedback, and the same techniques behind
            every piece in our shop — join online or in person.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12">
        <ThreadDivider variant="wave" animate={false} className="opacity-30" />
      </div>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        {cohorts.length === 0 ? (
          <p className="text-center text-text-on-cream-muted py-12">
            New cohorts are being scheduled — check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cohorts.map((c, i) => (
              <Link
                key={c.id}
                href={`/academy/${c.slug}`}
                className="block border border-line hover:border-gold-deep transition-colors group"
              >
                <div className="relative aspect-16/10 bg-cream-soft overflow-hidden">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    // <div className="absolute inset-0 flex items-center justify-center text-text-on-cream-muted text-sm">
                    //   No image yet
                    // </div>
                    <Image src={i % 2 ? ASSET_URL['file_fur2tb'] : ASSET_URL['file_oqef1k']} alt={i % 2 ? `file_fur2tb`: `file_oqef1k`} className="absolute inset-0 flex items-center justify-center text-cream/40 text-sm text-center object-cover" fill />
                  )}
                  <span className="absolute top-3 left-3 bg-ink text-gold-bright text-eyebrow px-3 py-1.5">
                    {c.status}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-eyebrow text-gold-deep mb-2">{modeLabel(c.modePolicy)}</p>
                  <h3 className="font-display text-xl mb-2 group-hover:text-gold-deep transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-text-on-cream-muted mb-4">
                    Starts {dateFmt.format(new Date(c.startDate))} · {c.duration}
                  </p>
                  <p className="font-semibold text-gold-deep">{currency.format(Number(c.price))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
