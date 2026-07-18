import { notFound, redirect } from "next/navigation";
import { getEnrolmentById } from "@/actions";
import { EnrolmentCheckout } from "@/components/public/enrolment-checkout";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const metadata = { title: "Confirm enrolment — Yarniebeauty" };

export default async function EnrolmentCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enrolment = await getEnrolmentById(id);

  if (!enrolment) notFound();

  if (enrolment.status !== "AwaitingPayment") {
    redirect("/dashboard/academy");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-9">
          <p className="text-eyebrow text-gold-deep mb-3">Almost there</p>
          <h1 className="text-display-lg">Confirm your enrolment</h1>
        </div>

        <div className="border border-line p-7 mb-8">
          <h2 className="font-display text-xl mb-4">{enrolment.cohort.title}</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Mode" value={enrolment.mode === "Online" ? "Online" : "In-person"} />
            <Row label="Starts" value={dateFmt.format(enrolment.cohort.startDate)} />
            <Row label="Duration" value={enrolment.cohort.duration} />
          </dl>
          <div className="flex justify-between font-semibold text-lg pt-4 mt-4 border-t border-line">
            <span>Total</span>
            <span>{currency.format(Number(enrolment.price))}</span>
          </div>
        </div>

        <EnrolmentCheckout enrolmentId={enrolment.id} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-on-cream-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
