import { notFound } from "next/navigation";
import { getAdminCohortById } from "@/actions";
import { CohortForm } from "@/components/admin/cohort-form";
import { CohortStatusControl } from "@/components/admin/cohort-status-control";
import { EnrolledStudentsTable } from "@/components/admin/enrolled-students-table";

export default async function AdminCohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cohort = await getAdminCohortById(id);

  if (!cohort) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-eyebrow text-gold-deep mb-2">Cohort</p>
          <h1 className="text-display-lg">{cohort.title}</h1>
        </div>
        <div className="w-48">
          <CohortStatusControl cohortId={cohort.id} currentStatus={cohort.status} />
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-eyebrow text-text-on-cream-muted">
            Enrolled students ({cohort.enrolments.length})
          </h2>
        </div>
        <div className="bg-white border border-line">
          <EnrolledStudentsTable enrolments={cohort.enrolments} />
        </div>
      </div>

      <div>
        <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Edit cohort details</h2>
        <CohortForm
          cohortId={cohort.id}
          existingImageUrl={cohort.image}
          initial={{
            title: cohort.title,
            description: cohort.description,
            price: Number(cohort.price),
            startDate: cohort.startDate.toISOString(),
            endDate: cohort.endDate.toISOString(),
            duration: cohort.duration,
            modePolicy: cohort.modePolicy,
            capacity: cohort.capacity,
          }}
        />
      </div>
    </div>
  );
}
