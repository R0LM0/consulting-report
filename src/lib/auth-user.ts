import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolves the id of the currently signed-in user, or null if there's no
 * session. This app is single-user, and NextAuth's default session doesn't
 * expose the DB id (only email/name), so this does one lookup by email
 * rather than wiring custom jwt/session callbacks for a single row.
 *
 * Callers decide how to react to `null`: Server Components/Actions should
 * `redirect("/login")`, Route Handlers should return a 401.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}
