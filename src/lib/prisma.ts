import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma's newer "prisma-client" generator requires an explicit driver
// adapter at runtime (the schema's datasource no longer embeds a URL).
// The connection string still comes from DATABASE_URL in the environment,
// which will point at the Neon Postgres instance once it exists.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
