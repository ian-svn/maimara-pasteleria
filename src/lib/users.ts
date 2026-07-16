import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { getClient } from "./sanity";

export type UserRole = "customer" | "admin";

export interface SanityUser {
  _id: string;
  email: string;
  name?: string;
  passwordHash: string;
  role?: UserRole;
  createdAt?: string;
}

export const MIN_PASSWORD_LENGTH = 5;

export function getAdminEmail(): string {
  return normalizeEmail(process.env.ADMIN_EMAIL || "admin@gmail.com");
}

export function isAdminEmail(email: string): boolean {
  return normalizeEmail(email) === getAdminEmail();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function userIdFromEmail(email: string): string {
  const hash = createHash("sha256")
    .update(normalizeEmail(email))
    .digest("hex")
    .slice(0, 24);
  return `user-${hash}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function findUserByEmail(
  email: string
): Promise<SanityUser | null> {
  const client = getClient();
  const normalized = normalizeEmail(email);
  return client.fetch(
    `*[_type == "user" && email == $email][0]{
      _id,
      email,
      name,
      passwordHash,
      role,
      createdAt
    }`,
    { email: normalized }
  );
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<SanityUser> {
  const email = normalizeEmail(input.email);

  // El correo admin puede (re)definir contraseña al "registrarse".
  if (isAdminEmail(email)) {
    return ensureAdminUser(input.password);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);
  const _id = userIdFromEmail(email);
  const client = getClient();

  await client.createOrReplace({
    _type: "user",
    _id,
    email,
    name: input.name?.trim() || undefined,
    passwordHash,
    role: "customer",
    createdAt: new Date().toISOString(),
  });

  return {
    _id,
    email,
    name: input.name?.trim() || undefined,
    passwordHash,
    role: "customer",
  };
}

/** Crea o actualiza el usuario admin de producción/desarrollo. */
export async function ensureAdminUser(password?: string): Promise<SanityUser> {
  const email = getAdminEmail();
  const adminPassword = password || process.env.ADMIN_PASSWORD || "admin";
  const existing = await findUserByEmail(email);
  const passwordHash = await hashPassword(adminPassword);
  const _id = existing?._id || userIdFromEmail(email);
  const client = getClient();

  await client.createOrReplace({
    _type: "user",
    _id,
    email,
    name: existing?.name || "Administrador",
    passwordHash,
    role: "admin",
    createdAt: existing?.createdAt || new Date().toISOString(),
  });

  return {
    _id,
    email,
    name: "Administrador",
    passwordHash,
    role: "admin",
  };
}
