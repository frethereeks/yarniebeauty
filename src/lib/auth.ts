import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: true },
        });

        // No local password set (e.g. Google-only account) — reject.
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        if (user.status === "Pending") {
          // Surface a distinct error code the login form can render specially,
          // prompting the user to check their inbox rather than a generic
          // "invalid credentials" message.
          throw new Error("EMAIL_NOT_CONFIRMED");
        }

        if (user.status === "Suspended") {
          throw new Error("ACCOUNT_SUSPENDED");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstname} ${user.lastname}`,
          image: user.image ?? undefined,
          roles: user.roles.map((r) => r.role),
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google sign-ins: create-or-activate the user record on first login,
      // matching the brief — provider "google" accounts are Active immediately,
      // never gated behind email confirmation.
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const [firstname, ...rest] = (user.name ?? "Yarniebeauty Customer").split(" ");
          const created = await prisma.user.create({
            data: {
              email: user.email,
              firstname: firstname || "Customer",
              lastname: rest.join(" ") || "",
              provider: "google",
              status: "Active",
              image: user.image ?? null,
              roles: { create: { role: "Customer" } },
              cart: { create: {} },
              notificationPref: { create: {} },
            },
          });
          user.id = created.id;
        } else if (existing.status === "Suspended") {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in, `user` is populated — capture the id immediately.
      if (user) {
        token.id = user.id;
      }

      // Re-fetch roles from the database on every token refresh, not just
      // on initial sign-in. Without this, a role change made directly in
      // the database (or by an admin action) would never be reflected in
      // an already-issued session until the user's JWT naturally expired —
      // since NextAuth's JWT strategy doesn't go back to the database on
      // its own otherwise. The extra query is worth the correctness here.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { roles: true },
        });

        if (dbUser) {
          token.roles = dbUser.roles.map((r) => r.role);
          token.status = dbUser.status;
        } else {
          // User no longer exists (deleted) — strip roles so they're
          // treated as signed out of anything privileged.
          token.roles = [];
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as string[]) ?? [];
      }
      return session;
    },
  },
});
