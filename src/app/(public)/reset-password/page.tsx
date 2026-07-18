import Link from "next/link";
import { ResetPasswordForm } from "@/components/public/reset-password-form";

export const metadata = { title: "Reset password — Yarniebeauty" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 text-center">
        <div>
          <p className="font-display text-2xl mb-3">Invalid link</p>
          <p className="text-text-on-cream-muted mb-8">This reset link is missing its token.</p>
          <Link href="/forgot-password" className="text-gold-deep underline underline-offset-2">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-eyebrow text-gold-deep mb-3">Almost there</p>
          <h1 className="text-display-lg">Choose a new password</h1>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
