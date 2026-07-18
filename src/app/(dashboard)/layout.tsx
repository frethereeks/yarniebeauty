import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasAnyEnrolment, getUnreadMessageCount, getDashboardUser } from "@/actions";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  const [showAcademy, unreadCount, user] = await Promise.all([
    hasAnyEnrolment(),
    getUnreadMessageCount(),
    getDashboardUser(),
  ]);

  const roles = session.user.roles ?? [];
  const isAdminOrSuperAdmin = roles.includes("Admin") || roles.includes("SuperAdmin");

  return (
    <DashboardShell
      showAcademy={showAcademy}
      unreadCount={unreadCount}
      userName={user ? `${user.firstname} ${user.lastname}` : ""}
      isAdminOrSuperAdmin={isAdminOrSuperAdmin}
    >
      {children}
    </DashboardShell>
  );
}
