"use client";

import { useTransition } from "react";
import { Select, App } from "antd";
import { updateCohortStatus } from "@/actions";

type TStatusTypes = "Upcoming" | "Ongoing" | "Completed" | "Cancelled"

export function CohortStatusControl({ cohortId, currentStatus }: { cohortId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const { message } = App.useApp();

  function handleChange(status: TStatusTypes) {
    startTransition(async () => {
      const result = await updateCohortStatus(cohortId, status);
      if (result.ok) message.success("Cohort status updated");
      else message.error(result.error);
    });
  }

  return (
    <Select
      size="large"
      className="w-full"
      defaultValue={currentStatus as TStatusTypes}
      disabled={isPending}
      onChange={handleChange}
      options={[
        { value: "Upcoming", label: "Upcoming" },
        { value: "Ongoing", label: "Ongoing" },
        { value: "Completed", label: "Completed" },
        { value: "Cancelled", label: "Cancelled" },
      ]}
    />
  );
}
