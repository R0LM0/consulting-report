import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const PLACEHOLDER_EMAIL = "consultant@example.com";
const PLACEHOLDER_PASSWORD = "change-me-before-seeding";
const PLACEHOLDER_NAME = "Consultant";

const email = process.env.SEED_USER_EMAIL ?? PLACEHOLDER_EMAIL;
const password = process.env.SEED_USER_PASSWORD ?? PLACEHOLDER_PASSWORD;
const name = process.env.SEED_USER_NAME ?? PLACEHOLDER_NAME;

if (
  !process.env.SEED_USER_EMAIL ||
  !process.env.SEED_USER_PASSWORD ||
  !process.env.SEED_USER_NAME
) {
  console.warn(
    "[seed] SEED_USER_EMAIL, SEED_USER_PASSWORD and/or SEED_USER_NAME are not set. " +
      "Falling back to placeholder credentials — set real values in .env before " +
      "seeding a real database.",
  );
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`[seed] Upserted user ${user.email} (id: ${user.id})`);
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
