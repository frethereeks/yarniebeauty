"use client";

import { useState, useTransition } from "react";
import { Switch, App } from "antd";
import { updateNotificationPreferences } from "@/actions";

type Prefs = {
  emailOrderUpdates: boolean;
  emailCohortReminders: boolean;
  emailBroadcasts: boolean;
  inAppNotifications: boolean;
};

export function NotificationPrefsForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [, startTransition] = useTransition();
  const { message } = App.useApp();

  function update(key: keyof Prefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    startTransition(async () => {
      const result = await updateNotificationPreferences(next);
      if (!result.ok) message.error(result.error);
    });
  }

  const rows: { key: keyof Prefs; label: string; description: string }[] = [
    {
      key: "emailOrderUpdates",
      label: "Order updates",
      description: "Email me when my order status changes",
    },
    {
      key: "emailCohortReminders",
      label: "Academy reminders",
      description: "Email me about cohort start dates and deadlines",
    },
    {
      key: "emailBroadcasts",
      label: "Announcements",
      description: "Email me general updates from Yarniebeauty",
    },
    {
      key: "inAppNotifications",
      label: "In-app notifications",
      description: "Show notifications inside my dashboard",
    },
  ];

  return (
    <div className="divide-y divide-line">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-sm">{row.label}</p>
            <p className="text-xs text-text-on-cream-muted">{row.description}</p>
          </div>
          <Switch checked={prefs[row.key]} onChange={(checked) => update(row.key, checked)} />
        </div>
      ))}
    </div>
  );
}
