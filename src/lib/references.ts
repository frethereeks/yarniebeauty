import crypto from "crypto";

/** Short random suffix — enough entropy to avoid collisions without being unwieldy. */
function shortId(length = 8): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
}

/** e.g. "YB-20260624-9F3A2B1C" */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `YB-${date}-${shortId(8)}`;
}

/** e.g. "YB-ORD-<reference>" / "YB-ENR-<reference>" — sent to Paystack as the transaction reference. */
export function generatePaymentReference(kind: "ORD" | "ENR"): string {
  return `YB-${kind}-${shortId(10)}-${Date.now()}`;
}
