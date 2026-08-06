import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {
  findUserByEmail,
  isAdminEmail,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  verifyPassword,
  type UserRole,
} from "@/lib/users";
import { getClient } from "@/lib/sanity";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/iniciar-sesion",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;

        if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
          return null;
        }

        const email = normalizeEmail(emailRaw);
        if (!isValidEmail(email) || passwordRaw.length < MIN_PASSWORD_LENGTH) {
          return null;
        }

        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(passwordRaw, user.passwordHash);
        if (!valid) return null;

        const role: UserRole =
          user.role === "admin" || isAdminEmail(email) ? "admin" : "customer";

        // Asegura rol admin en Sanity si entra con el correo configurado.
        if (role === "admin" && user.role !== "admin") {
          try {
            await getClient().patch(user._id).set({ role: "admin" }).commit();
          } catch {
            /* no bloquear login */
          }
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name ?? null,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.email = String(token.email ?? "");
        session.user.name = (token.name as string | null | undefined) ?? null;
        session.user.role = token.role === "admin" ? "admin" : "customer";
      }
      return session;
    },
  },
});
