import { createClient } from "@sanity/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { seedProducts } from "../src/lib/mockProducts";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;
const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com")
  .trim()
  .toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "admin";

if (!projectId || !token) {
  console.error("Configurá NEXT_PUBLIC_SANITY_PROJECT_ID y SANITY_API_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

function userIdFromEmail(email: string): string {
  const hash = createHash("sha256").update(email).digest("hex").slice(0, 24);
  return `user-${hash}`;
}

async function seed() {
  console.log(`Sembrando ${seedProducts.length} productos en ${projectId}/${dataset}...`);

  const transaction = client.transaction();

  for (const product of seedProducts) {
    transaction.createOrReplace({
      ...product,
      available: true,
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const adminId = userIdFromEmail(adminEmail);
  transaction.createOrReplace({
    _type: "user",
    _id: adminId,
    email: adminEmail,
    name: "Administrador",
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  await transaction.commit();
  console.log(`Admin listo: ${adminEmail}`);
  console.log("Seed completado.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
