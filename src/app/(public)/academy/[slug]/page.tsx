import { notFound } from "next/navigation";
import { getCohortBySlug } from "@/actions";
import { auth } from "@/lib/auth";
import { EnrolForm } from "@/components/public/enrol-form";
import { ThreadDivider } from "@/components/shared/thread-divider";
import Image from "next/image";
import { ASSET_URL } from "@/assets";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function modeLabel(policy: string) {
  if (policy === "PhysicalOnly") return "In-person only";
  if (policy === "OnlineOnly") return "Online only";
  return "Online or in-person — your choice";
}

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [cohort, session] = await Promise.all([getCohortBySlug(slug), auth()]);

  if (!cohort) notFound();

  const isOpen = cohort.status === "Upcoming" || cohort.status === "Ongoing";
  const spotsLeft = cohort.capacity != null ? cohort.capacity - cohort._count.enrolments : null;
  const full = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="relative aspect-4/5 bg-cream-soft overflow-hidden">
          {cohort.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cohort.image} alt={cohort.title} className="w-full h-full object-cover" />
          ) : (
            // <div className="absolute inset-0 flex items-center justify-center text-text-on-cream-muted text-sm">
            //   No image yet
            // </div>
            <Image src={ASSET_URL['file_fur2tb'].src} alt="file_fur2tb" className="absolute inset-0 flex items-center justify-center text-cream/40 text-sm text-center object-cover" fill />
          )}
        </div>

        <div>
          <p className="text-eyebrow text-gold-deep mb-3">{modeLabel(cohort.modePolicy)}</p>
          <h1 className="text-display-lg mb-4">{cohort.title}</h1>
          <p className="text-2xl font-display text-gold-deep mb-6">
            {currency.format(Number(cohort.price))}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="text-text-on-cream-muted">Starts</p>
              <p className="font-medium">{dateFmt.format(new Date(cohort.startDate))}</p>
            </div>
            <div>
              <p className="text-text-on-cream-muted">Ends</p>
              <p className="font-medium">{dateFmt.format(new Date(cohort.endDate))}</p>
            </div>
            <div>
              <p className="text-text-on-cream-muted">Duration</p>
              <p className="font-medium">{cohort.duration}</p>
            </div>
            {spotsLeft !== null && (
              <div>
                <p className="text-text-on-cream-muted">Spots left</p>
                <p className="font-medium">{Math.max(0, spotsLeft)}</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <ThreadDivider variant="straight" animate={false} className="opacity-30" />
          </div>

          <div className="text-text-on-cream-muted leading-relaxed mb-9 whitespace-pre-line">
            {cohort.description}
          </div>

          {isOpen && !full ? (
            <EnrolForm
              cohortId={cohort.id}
              modePolicy={cohort.modePolicy}
              isAuthenticated={!!session?.user}
            />
          ) : (
            <div className="border border-line px-5 py-4 text-text-on-cream-muted text-sm">
              {full ? "This cohort is full." : "This cohort isn't open for enrolment right now."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
