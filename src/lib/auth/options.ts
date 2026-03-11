import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const NINETY_DAYS = 90 * 24 * 60 * 60; // seconds

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            console.log("[Auth] User not found or no password:", credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValid) {
            console.log("[Auth] Invalid password for:", credentials.email);
            return null;
          }

          console.log("[Auth] Success:", user.email, user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            rememberMe: credentials.rememberMe === "true",
          };
        } catch (error) {
          console.error("[Auth] Error during authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: NINETY_DAYS,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: NINETY_DAYS, // persist cookie across browser restarts
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error — role is on our user object
        token.role = user.role;
        // @ts-expect-error — rememberMe is on our user object
        if (!user.rememberMe) {
          // Session cookie: expire the JWT in 8 hours instead of 90 days
          token.exp = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
        }
      }
      // Refresh role + directorId from DB on every request so changes take effect immediately
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, directorId: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.directorId = dbUser.directorId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error — role is on token
        session.user.role = token.role;
        // @ts-expect-error — directorId is on token
        session.user.directorId = token.directorId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
