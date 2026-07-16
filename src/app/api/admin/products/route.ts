import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getWriteClient } from "@/lib/sanity";
import { PRODUCT_CATEGORIES } from "@/lib/types";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categoryValues = PRODUCT_CATEGORIES.map((c) => c.value);

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const price = Number(form.get("price"));
    const category = String(form.get("category") || "");
    const available = form.get("available") !== "false";
    const image = form.get("image");

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }
    if (!categoryValues.includes(category as (typeof categoryValues)[number])) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const client = getWriteClient();
    let imageAsset: { _type: "image"; asset: { _type: "reference"; _ref: string } } | undefined;

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "El archivo debe ser una imagen" },
          { status: 400 }
        );
      }
      if (image.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { error: "La imagen no puede superar 8 MB" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const asset = await client.assets.upload("image", buffer, {
        filename: image.name,
        contentType: image.type,
      });
      imageAsset = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    const slug = slugify(name) || `producto-${Date.now()}`;
    const doc = await client.create({
      _type: "product",
      name,
      slug: { _type: "slug", current: slug },
      description,
      price,
      category,
      available,
      ...(imageAsset ? { image: imageAsset } : {}),
    });

    return NextResponse.json({ ok: true, productId: doc._id }, { status: 201 });
  } catch (err) {
    console.error("Error al crear producto:", err);
    return NextResponse.json(
      { error: "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}
