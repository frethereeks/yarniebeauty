import { PrismaClient } from "@prisma/client";

/**
 * Next.js hot-reloads modules in dev, which would otherwise spin up a fresh
 * PrismaClient (and DB connection pool) on every edit. Caching it on the
 * global object keeps a single instance alive across reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
