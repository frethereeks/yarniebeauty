import Link from "next/link";
import { verifyPayment } from "@/actions";

export const metadata = { title: "Confirming payment — Yarniebeauty" };

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; type?: string }>;
}) {
  const { reference } = await searchParams;

  if (!reference) {
    return (
      <StatusScreen
        title="Missing payment reference"
        body="We couldn't find a payment reference in the URL. If you completed a payment, check your dashboard before retrying."
        ctaHref="/dashboard"
        ctaLabel="Go to dashboard"
      />
    );
  }

  const result = await verifyPayment(reference);

  if (!result.ok) {
    return (
      <StatusScreen
        title="Payment not confirmed"
        body={result.error}
        ctaHref="/cart"
        ctaLabel="Back to cart"
        isError
      />
    );
  }

  if (result.data?.type === "order") {
    return (
      <StatusScreen
        title="Payment successful"
        body={`Thank you — your order ${result.data.orderNumber} has been confirmed. We're preparing it with care.`}
        ctaHref="/dashboard/orders"
        ctaLabel="View my orders"
      />
    );
  }

  return (
    <StatusScreen
      title="Payment successful"
      body={`You're enrolled in ${result.data?.cohortTitle}. We'll see you there.`}
      ctaHref="/dashboard/academy"
      ctaLabel="View my academy"
    />
  );
}

function StatusScreen({
  title,
  body,
  ctaHref,
  ctaLabel,
  isError = false,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  isError?: boolean;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <p className={`font-display text-2xl mb-3 ${isError ? "text-error" : ""}`}>{title}</p>
        <p className="text-text-on-cream-muted mb-8 leading-relaxed">{body}</p>
        <Link
          href={ctaHref}
          className="inline-flex items-center px-7 py-3.5 bg-ink text-cream text-eyebrow font-semibold hover:bg-charcoal transition-colors"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
