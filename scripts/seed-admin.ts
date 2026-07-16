import { createClient } from "@sanity/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;
const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com")
  .trim()
  .toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "admin";

if (!projectId || !token) {
  console.error("Faltan variables de Sanity.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function main() {
  const _id = `user-${createHash("sha256").update(adminEmail).digest("hex").slice(0, 24)}`;
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await client.createOrReplace({
    _type: "user",
    _id,
    email: adminEmail,
    name: "Administrador",
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  console.log(`Admin listo → ${adminEmail}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
