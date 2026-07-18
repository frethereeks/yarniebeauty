"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { enrolInCohort } from "@/actions";

export function EnrolForm({
  cohortId,
  modePolicy,
  isAuthenticated,
}: {
  cohortId: string;
  modePolicy: "PhysicalOnly" | "OnlineOnly" | "StudentChoice";
  isAuthenticated: boolean;
}) {
  const [mode, setMode] = useState<"Physical" | "Online">(
    modePolicy === "PhysicalOnly" ? "Physical" : "Online"
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { message } = App.useApp();

  function handleEnrol() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      const result = await enrolInCohort(cohortId, mode);
      if (result.ok) {
        router.push(`/checkout/enrolment/${result.data?.enrolmentId}`);
      } else {
        message.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {modePolicy === "StudentChoice" && (
        <div>
          <p className="text-eyebrow text-text-on-cream-muted mb-3">Choose how you'll attend</p>
          <div className="grid grid-cols-2 gap-3">
            {(["Online", "Physical"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-3 border text-sm font-medium transition-colors ${
                  mode === m
                    ? "border-gold-deep bg-cream-soft text-ink"
                    : "border-line text-text-on-cream-muted hover:border-gold-deep"
                }`}
              >
                {m === "Online" ? "Online" : "In-person"}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleEnrol}
        disabled={isPending}
        className="w-full bg-gold text-ink text-eyebrow font-semibold py-3.5 hover:bg-gold-bright transition-colors disabled:opacity-60"
      >
        {isPending ? "Enrolling…" : "Enrol now"}
      </button>
    </div>
  );
}
