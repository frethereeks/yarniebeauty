import Link from "next/link";
import { ForgotPasswordForm } from "@/components/public/forgot-password-form";

export const metadata = { title: "Forgot password — Yarniebeauty" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-eyebrow text-gold-deep mb-3">Trouble signing in?</p>
          <h1 className="text-display-lg">Reset your password</h1>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-text-on-cream-muted mt-8">
          <Link href="/login" className="text-gold-deep underline underline-offset-2">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
