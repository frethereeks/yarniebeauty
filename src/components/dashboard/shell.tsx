"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function buildNavItems(showAcademy: boolean): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <GridIcon /> },
    { href: "/dashboard/orders", label: "Orders", icon: <BagIcon /> },
  ];
  if (showAcademy) {
    items.push({ href: "/dashboard/academy", label: "Academy", icon: <BookIcon /> });
  }
  items.push(
    { href: "/dashboard/messages", label: "Messages", icon: <MailIcon /> },
    { href: "/dashboard/settings", label: "Profile & Settings", icon: <UserIcon /> }
  );
  return items;
}

export function DashboardShell({
  showAcademy,
  unreadCount,
  userName,
  isAdminOrSuperAdmin,
  children,
}: {
  showAcademy: boolean;
  unreadCount: number;
  userName: string;
  isAdminOrSuperAdmin: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const items = buildNavItems(showAcademy);

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-ink text-cream shrink-0">
        <Link href="/" className="flex items-center gap-2.5 px-7 py-6 border-b border-line-dark">
          <Logo size={36} />
          <span className="font-display text-xl font-semibold">
            Yarnie<span className="text-gold-bright">beauty</span>
          </span>
        </Link>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-ink-soft text-gold-bright"
                    : "text-cream/75 hover:bg-ink-soft hover:text-gold-bright"
                }`}
              >
                {item.icon}
                {item.label}
                {item.href === "/dashboard/messages" && unreadCount > 0 && (
                  <span className="ml-auto bg-gold text-ink text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-5 border-t border-line-dark">
          <p className="text-xs text-cream/50 mb-3 px-2 truncate">{userName}</p>
          {isAdminOrSuperAdmin && (
            <Link
              href="/admin"
              className="block px-4 py-2.5 mb-1 text-sm text-gold-bright hover:text-gold-bright bg-ink-soft hover:bg-charcoal transition-colors"
            >
              Admin dashboard →
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2.5 text-sm text-cream/75 hover:text-gold-bright hover:bg-ink-soft transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-ink text-cream h-16 flex items-center justify-between px-5 border-b border-line-dark">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="font-display text-lg font-semibold">
            Yarnie<span className="text-gold-bright">beauty</span>
          </span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
          <MenuIcon />
        </button>
      </div>

      {/* Mobile drawer */}
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
                className="flex items-center gap-3 px-4 py-3.5 text-base text-cream/85 hover:text-gold-bright"
              >
                {item.icon}
                {item.label}
                {item.href === "/dashboard/messages" && unreadCount > 0 && (
                  <span className="ml-auto bg-gold text-ink text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="px-5 py-5 border-t border-line-dark mt-4 space-y-3">
            {isAdminOrSuperAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block text-gold-bright"
              >
                Admin dashboard →
              </Link>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-cream/75 hover:text-gold-bright"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">{children}</div>
      </main>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" /><path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20V4H6.5A2.5 2.5 0 004 6.5v13z" strokeLinejoin="round" />
      <path d="M4 19.5V6.5" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
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
