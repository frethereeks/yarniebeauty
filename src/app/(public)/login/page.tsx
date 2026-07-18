import Link from "next/link";
import { LoginForm } from "@/components/public/login-form";
import { GoogleSignInButton } from "@/components/public/google-signin-button";

export const metadata = { title: "Login — Yarniebeauty" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextUrl = next && next.startsWith("/") ? next : "/dashboard";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-eyebrow text-gold-deep mb-3">Welcome back</p>
          <h1 className="text-display-lg">Sign in</h1>
        </div>

        <GoogleSignInButton callbackUrl={nextUrl} />

        <div className="flex items-center gap-3 my-7">
          <span className="flex-1 h-px bg-line" />
          <span className="text-xs text-text-on-cream-muted">or</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        <LoginForm nextUrl={nextUrl} />

        <p className="text-center text-sm text-text-on-cream-muted mt-8">
          New to Yarniebeauty?{" "}
          <Link href="/register" className="text-gold-deep underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
