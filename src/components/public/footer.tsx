import Link from "next/link";
import { ThreadDivider } from "@/components/shared/thread-divider";
import { Logo } from "@/components/shared/logo";

export function PublicFooter() {
  return (
    <footer className="bg-ink text-cream mt-auto">
      <div className="px-5 sm:px-8 pt-2">
        <ThreadDivider variant="straight" animate={false} className="opacity-40" />
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Logo size={44} />
            <p className="font-display text-2xl font-semibold text-cream">
              Yarnie<span className="text-gold-bright">beauty</span>
            </p>
          </div>
          <p className="text-cream/70 text-sm leading-relaxed max-w-sm">
            Hand-finished yarn and made-to-order crochet pieces, paired with an
            academy for anyone who wants to learn the craft from scratch.
          </p>
        </div>

        <div>
          <p className="text-eyebrow text-gold-bright mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><Link href="/products" className="hover:text-gold-bright">Shop products</Link></li>
            <li><Link href="/academy" className="hover:text-gold-bright">Academy cohorts</Link></li>
            <li><Link href="/about" className="hover:text-gold-bright">About us</Link></li>
            <li><Link href="/contact" className="hover:text-gold-bright">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-eyebrow text-gold-bright mb-4">Account</p>
          <ul className="space-y-2.5 text-sm text-cream/75">
            <li><Link href="/login" className="hover:text-gold-bright">Login</Link></li>
            <li><Link href="/register" className="hover:text-gold-bright">Create account</Link></li>
            <li><Link href="/dashboard/orders" className="hover:text-gold-bright">Track an order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line-dark/60 py-5 px-5 sm:px-8 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Yarniebeauty. All rights reserved.
      </div>
    </footer>
  );
}
