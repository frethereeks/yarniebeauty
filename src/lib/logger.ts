import { prisma } from "@/lib/prisma";
import type { LogAction } from "@prisma/client";

/**
 * Records an admin/super_admin action for auditing. Called from every
 * server action that mutates products, orders, cohorts, roles, or sends
 * broadcasts. Never throws — a logging failure should never block the
 * actual operation it's recording.
 */
export async function logAction(opts: {
  actorId: string | null;
  action: LogAction;
  table: string;
  message: string;
}) {
  try {
    await prisma.logger.create({
      data: {
        actorId: opts.actorId,
        action: opts.action,
        table: opts.table,
        message: opts.message,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
