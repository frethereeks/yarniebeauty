import { getAllUsersForTeamManagement } from "@/actions";
import { TeamTable } from "@/components/admin/team-table";

export default async function AdminTeamPage() {
  const users = await getAllUsersForTeamManagement();

  return (
    <div>
      <h1 className="text-display-lg mb-2">Team &amp; Roles</h1>
      <p className="text-text-on-cream-muted mb-8 max-w-2xl">
        Promote a user to Admin, then grant the specific areas they should manage.
        Super admins always have full access and can't be modified here.
      </p>
      <TeamTable initialUsers={users} />
    </div>
  );
}
