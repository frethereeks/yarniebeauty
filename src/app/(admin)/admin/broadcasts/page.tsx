import { getBroadcastHistory } from "@/actions";
import { BroadcastComposer } from "@/components/admin/broadcast-composer";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const AUDIENCE_LABELS: Record<string, string> = {
  ALL: "All active members",
  CUSTOMERS: "Customers",
  STUDENTS: "Students",
};

export default async function BroadcastsPage() {
  const history = await getBroadcastHistory();

  return (
    <div>
      <h1 className="text-display-lg mb-2">Broadcasts</h1>
      <p className="text-text-on-cream-muted mb-8 max-w-2xl">
        Send a message to all active members, or target customers or students specifically.
      </p>

      <div className="grid lg:grid-cols-2 gap-10">
        <BroadcastComposer />

        <div>
          <h2 className="text-eyebrow text-text-on-cream-muted mb-5">Recent broadcasts</h2>
          {history.length === 0 ? (
            <p className="text-text-on-cream-muted text-sm">No broadcasts sent yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((b) => (
                <div key={b.id} className="border border-line bg-white p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{b.subject}</p>
                    <span className="text-xs text-gold-deep font-semibold">{AUDIENCE_LABELS[b.audience]}</span>
                  </div>
                  <p className="text-xs text-text-on-cream-muted mb-2">
                    Sent by {b.sender.firstname} {b.sender.lastname} · {dateFmt.format(b.createdAt)} ·{" "}
                    {b.recipientCount} recipient{b.recipientCount === 1 ? "" : "s"}
                  </p>
                  <p className="text-sm text-text-on-cream-muted line-clamp-2">{b.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
