import { auth } from "@/lib/auth";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <>
      <PublicNavbar isAuthenticated={!!session?.user} />
      <main className="flex-1 bg-cream text-text-on-cream">{children}</main>
      <PublicFooter />
    </>
  );
}
