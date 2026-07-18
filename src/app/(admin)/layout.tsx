import { redirect } from "next/navigation";
import { getAdminContext } from "@/actions";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext();

  if (!ctx) {
    redirect("/dashboard");
  }

  return (
    <AdminShell isSuperAdmin={ctx.isSuperAdmin} permissions={Array.from(ctx.permissions)} name={ctx.name}>
      {children}
    </AdminShell>
  );
}
