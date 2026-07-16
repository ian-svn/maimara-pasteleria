import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getWriteClient } from "@/lib/sanity";
import { PRODUCT_CATEGORIES } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const categoryValues = PRODUCT_CATEGORIES.map((c) => c.value);

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const priceRaw = form.get("price");
    const category = String(form.get("category") || "");
    const available = form.get("available") !== "false";
    const image = form.get("image");

    const client = getWriteClient();
    const existing = await client.fetch(`*[_type == "product" && _id == $id][0]._id`, {
      id,
    });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const patch: Record<string, unknown> = { available };

    if (name) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (priceRaw != null && String(priceRaw) !== "") {
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }
      patch.price = price;
    }
    if (category) {
      if (!categoryValues.includes(category as (typeof categoryValues)[number])) {
        return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
      }
      patch.category = category;
    }

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "El archivo debe ser una imagen" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await image.arrayBuffer());
      const asset = await client.assets.upload("image", buffer, {
        filename: image.name,
        contentType: image.type,
      });
      patch.image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    await client.patch(id).set(patch).commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const client = getWriteClient();
    await client.patch(id).set({ available: false }).commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al desactivar producto:", err);
    return NextResponse.json(
      { error: "No se pudo desactivar el producto" },
      { status: 500 }
    );
  }
}
