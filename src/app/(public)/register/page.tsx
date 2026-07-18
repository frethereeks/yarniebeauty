import Link from "next/link";
import { RegisterForm } from "@/components/public/register-form";
import { GoogleSignInButton } from "@/components/public/google-signin-button";

export const metadata = { title: "Create account — Yarniebeauty" };

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-eyebrow text-gold-deep mb-3">Join Yarniebeauty</p>
          <h1 className="text-display-lg">Create your account</h1>
        </div>

        <GoogleSignInButton callbackUrl="/dashboard" />

        <div className="flex items-center gap-3 my-7">
          <span className="flex-1 h-px bg-line" />
          <span className="text-xs text-text-on-cream-muted">or</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-text-on-cream-muted mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-deep underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
