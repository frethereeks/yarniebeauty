"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";

type NavItem = { href: string; label: string; show: boolean };

export function AdminShell({
  isSuperAdmin,
  permissions,
  name,
  children,
}: {
  isSuperAdmin: boolean;
  permissions: string[];
  name: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const permSet = new Set(permissions);

  const has = (p: string) => isSuperAdmin || permSet.has(p);

  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard", show: true },
    { href: "/admin/products", label: "Products", show: has("MANAGE_PRODUCTS") },
    { href: "/admin/orders", label: "Orders", show: has("MANAGE_ORDERS") },
    { href: "/admin/academy", label: "Academy", show: has("MANAGE_COHORTS") || has("MANAGE_ENROLMENTS") },
    { href: "/admin/contact-messages", label: "Contact Messages", show: has("MANAGE_CONTACT_MESSAGES") },
    { href: "/admin/team", label: "Team & Roles", show: isSuperAdmin },
    // { href: "/admin/broadcasts", label: "Broadcasts", show: isSuperAdmin || has("SEND_BROADCASTS") },
    { href: "/admin/revenue", label: "Revenue", show: isSuperAdmin },
    // { href: "/admin/logs", label: "Audit Log", show: isSuperAdmin || has("VIEW_LOGGER") },
  ].filter((i) => i.show);

  return (
    <div className="min-h-screen flex bg-cream-soft">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-ink text-cream shrink-0">
        <Link href="/" className="flex items-center gap-2.5 px-7 py-6 border-b border-line-dark">
          <Logo size={36} />
          <span className="font-display text-xl font-semibold">
            Yarnie<span className="text-gold-bright">beauty</span>
            <span className="block text-xs font-body font-normal tracking-widest text-cream/50 mt-0.5">ADMIN</span>
          </span>
        </Link>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-sm transition-colors ${
                  active ? "bg-ink-soft text-gold-bright" : "text-cream/75 hover:bg-ink-soft hover:text-gold-bright"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-5 border-t border-line-dark">
          <p className="text-xs text-cream/50 mb-1 px-2 truncate">{name}</p>
          <p className="text-xs text-gold-bright mb-3 px-2">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
          <Link href="/dashboard" className="block px-4 py-2 text-sm text-cream/75 hover:text-gold-bright">
            User dashboard
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2.5 text-sm text-cream/75 hover:text-gold-bright"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-ink text-cream h-16 flex items-center justify-between px-5 border-b border-line-dark">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={30} />
          <span className="font-display text-lg font-semibold">
            Yarnie<span className="text-gold-bright">beauty</span> Admin
          </span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
          <MenuIcon />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink text-cream">
          <div className="flex items-center justify-between px-5 h-16 border-b border-line-dark">
            <span className="font-display text-lg font-semibold">Menu</span>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
              <CloseIcon />
            </button>
          </div>
          <nav className="px-3 py-5 space-y-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 text-base text-cream/85 hover:text-gold-bright"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
