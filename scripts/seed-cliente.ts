import { createClient } from "@sanity/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

const email = "cliente@gmail.com";
const password = "cliente123";

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
  const userId = `user-${createHash("sha256").update(email).digest("hex").slice(0, 24)}`;
  const passwordHash = await bcrypt.hash(password, 12);

  await client.createOrReplace({
    _type: "user",
    _id: userId,
    email,
    name: "Cliente",
    passwordHash,
    role: "customer",
    createdAt: new Date().toISOString(),
  });

  const product = await client.fetch<{ _id: string; price: number; name: string } | null>(
    `*[_type == "product" && name match "Torta*"][0]{ _id, price, name }`
  );

  if (!product) {
    console.log(`Cliente listo → ${email}`);
    console.log("No encontré una torta para armar el pedido de ejemplo.");
    return;
  }

  const deadline = new Date("2026-11-14T21:00:00.000Z");

  await client.createOrReplace({
    _id: "order-cliente-demo",
    _type: "order",
    user: { _type: "reference", _ref: userId },
    customerName: "Cliente",
    contactPhone: "11 5555-1234",
    orderDate: new Date().toISOString(),
    deliveryMethod: "pickup",
    paymentMethod: "transfer",
    paymentStatus: "pending",
    status: "preparing",
    deliveryDeadline: deadline.toISOString(),
    totalAmount: product.price,
    items: [
      {
        _type: "orderItem",
        _key: "torta",
        product: { _type: "reference", _ref: product._id },
        quantity: 1,
      },
    ],
  });

  console.log(`Cliente listo → ${email} / ${password}`);
  console.log(`Pedido de ejemplo: ${product.name}, retiro, transferencia, plazo ${deadline.toISOString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
