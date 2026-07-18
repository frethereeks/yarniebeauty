import Link from "next/link";
import { getAdminCohorts } from "@/actions";
import { CohortsTable } from "@/components/admin/cohorts-table";

export default async function AdminAcademyPage() {
  const cohorts = await getAdminCohorts();
  const cohortsData = cohorts.map(el => ({id: el.id, title: el.title, price: +(el.price), startDate: el.startDate, endDate: el.endDate, status: el.status, modePolicy: el.modePolicy, _count: {enrolments: el._count.enrolments}}))

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-display-lg">Academy cohorts</h1>
        <Link
          href="/admin/academy/new"
          className="border border-line-dark bg-ink text-gold text-eyebrow font-semibold px-5 py-2.5 hover:text-gold-bright transition-colors"
        >
          + New cohort
        </Link>
      </div>

      <div className="bg-white border border-line w-full overflow-x-scroll md:overflow-clip">
        <CohortsTable cohorts={cohortsData} />
      </div>
    </div>
  );
}
