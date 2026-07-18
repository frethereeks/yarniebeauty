import Link from "next/link";
import { confirmEmail } from "@/actions";

export const metadata = { title: "Confirm email — Yarniebeauty" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await confirmEmail(token)
    : { ok: false as const, error: "Missing confirmation token." };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm text-center">
        {result.ok ? (
          <>
            <p className="font-display text-2xl mb-3">You&apos;re all set</p>
            <p className="text-text-on-cream-muted mb-8">
              Your email has been confirmed. You can now sign in to your account.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-3.5 bg-ink text-cream text-eyebrow font-semibold hover:bg-charcoal transition-colors"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <p className="font-display text-2xl mb-3">Confirmation failed</p>
            <p className="text-text-on-cream-muted mb-8">{result.error}</p>
            <Link href="/login" className="text-gold-deep underline underline-offset-2">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
