import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaQueryTimingAttached?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.PRISMA_QUERY_TIMING === "1"
        ? ["error", "warn", { emit: "event", level: "query" }]
        : ["error", "warn"],
  });

// Opt-in query timing helps distinguish slow SQL from app rendering and remote
// database round-trip time without logging query text or parameter values.
if (
  process.env.PRISMA_QUERY_TIMING === "1" &&
  !globalForPrisma.prismaQueryTimingAttached
) {
  (prisma as PrismaClient<
    { log: Array<Prisma.LogLevel | Prisma.LogDefinition> },
    "query"
  >).$on("query", (event) => {
    console.info(`[db] query completed in ${event.duration}ms`);
  });
  globalForPrisma.prismaQueryTimingAttached = true;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

