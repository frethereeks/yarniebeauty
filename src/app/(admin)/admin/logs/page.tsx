import { getAuditLogs } from "@/actions";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-success",
  UPDATE: "text-gold-deep",
  DELETE: "text-error",
  STATUS_CHANGE: "text-gold-deep",
  LOGIN: "text-text-on-cream-muted",
  ROLE_CHANGE: "text-error",
  BROADCAST: "text-gold-deep",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const { logs, total, pageSize } = await getAuditLogs(pageNum);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-display-lg mb-2">Audit log</h1>
      <p className="text-text-on-cream-muted mb-8">A record of every admin action, for accountability.</p>

      <div className="bg-white border border-line divide-y divide-line">
        {logs.map((log) => (
          <div key={log.id} className="p-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm">
                <span className={`font-semibold ${ACTION_COLORS[log.action] ?? ""}`}>{log.action}</span>
                <span className="text-text-on-cream-muted"> on {log.table}</span>
              </p>
              <p className="text-sm mt-1">{log.message}</p>
              <p className="text-xs text-text-on-cream-muted mt-1">
                {log.actor ? `${log.actor.firstname} ${log.actor.lastname} (${log.actor.email})` : "System"}
              </p>
            </div>
            <p className="text-xs text-text-on-cream-muted whitespace-nowrap">{dateFmt.format(log.createdAt)}</p>
          </div>
        ))}
        {logs.length === 0 && <p className="p-6 text-text-on-cream-muted text-sm">No actions logged yet.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/logs?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center text-sm border ${
                p === pageNum ? "bg-ink text-cream border-ink" : "border-line text-text-on-cream-muted"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
