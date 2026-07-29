import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config: no providers, no Prisma/bcrypt imports here.
// middleware.ts uses this directly so its bundle never pulls in Node-only
// dependencies (Prisma's generated client uses node:path / node:url, which
// the Edge runtime doesn't support). The full config with the Credentials
// provider lives in src/auth.ts and is used everywhere else (API routes,
// server components), where the Node.js runtime is available.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
