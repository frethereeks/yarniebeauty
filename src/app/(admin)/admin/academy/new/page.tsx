import { CohortForm } from "@/components/admin/cohort-form";

export default function NewCohortPage() {
  return (
    <div>
      <h1 className="text-display-lg mb-2">New cohort</h1>
      <p className="text-text-on-cream-muted mb-8">New cohorts start in "Upcoming" status.</p>
      <CohortForm />
    </div>
  );
}
