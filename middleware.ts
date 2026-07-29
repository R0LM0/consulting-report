import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Deliberately built from the lightweight authConfig (no providers, no
// Prisma/bcrypt) rather than @/auth, so this stays Edge-runtime safe.
// Route protection itself is handled by authConfig's `authorized` callback.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on every route except static assets and the auth API routes
  // (NextAuth's own endpoints must stay reachable while unauthenticated).
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
