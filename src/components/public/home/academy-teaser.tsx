import Link from "next/link";

type CohortPreview = {
  id: string;
  slug: string;
  title: string;
  price: number | string;
  startDate: Date;
  duration: string;
  modePolicy: string;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function modeLabel(policy: string) {
  if (policy === "PhysicalOnly") return "In-person";
  if (policy === "OnlineOnly") return "Online";
  return "Online or in-person";
}

export function AcademyTeaser({ cohorts }: { cohorts: CohortPreview[] }) {
  return (
    <section className="bg-ink text-cream py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-eyebrow text-gold-bright mb-3">Yarniebeauty Academy</p>
            <h2 className="text-display-lg text-cream">Learn the craft, cohort by cohort</h2>
          </div>
          <Link
            href="/academy"
            className="text-eyebrow text-gold-bright hover:text-cream underline underline-offset-4"
          >
            View all cohorts →
          </Link>
        </div>

        {cohorts.length === 0 ? (
          <p className="text-cream/60">New cohorts are being scheduled — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cohorts.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/academy/${c.slug}`}
                className="block border border-line-dark p-7 hover:border-gold transition-colors group"
              >
                <p className="text-eyebrow text-gold-bright mb-3">{modeLabel(c.modePolicy)}</p>
                <h3 className="font-display text-2xl mb-3 group-hover:text-gold-bright transition-colors">
                  {c.title}
                </h3>
                <p className="text-cream/65 text-sm mb-5">
                  Starts {dateFmt.format(new Date(c.startDate))} · {c.duration}
                </p>
                <p className="text-gold-bright font-semibold">{currency.format(Number(c.price))}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
