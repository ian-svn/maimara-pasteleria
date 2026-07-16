import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWriteClient, isSanityConfigured } from "@/lib/sanity";
import { getProductsByIds } from "@/lib/queries";
import type { CreateOrderPayload, DeliveryMethod } from "@/lib/types";

export async function POST(request: Request) {
  if (!isSanityConfigured) {
    return NextResponse.json(
      { error: "Sanity no está configurado" },
      { status: 503 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debés iniciar sesión para hacer un pedido" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as CreateOrderPayload;

    if (
      !body.customerName?.trim() ||
      !body.contactPhone?.trim() ||
      !body.deliveryMethod ||
      !body.items?.length
    ) {
      return NextResponse.json(
        { error: "Datos del pedido incompletos" },
        { status: 400 }
      );
    }

    const deliveryMethod = body.deliveryMethod as DeliveryMethod;
    if (deliveryMethod !== "pickup" && deliveryMethod !== "delivery") {
      return NextResponse.json(
        { error: "Método de entrega inválido" },
        { status: 400 }
      );
    }

    if (deliveryMethod === "delivery" && !body.deliveryAddress?.trim()) {
      return NextResponse.json(
        { error: "La dirección es obligatoria para envíos" },
        { status: 400 }
      );
    }

    const productIds = body.items.map((item) => item.productId);
    const products = await getProductsByIds(productIds);
    const productMap = new Map(products.map((p) => [p._id, p]));

    const normalizedItems: { productId: string; quantity: number }[] = [];
    let totalAmount = 0;

    for (const item of body.items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          { error: "Cantidad inválida en el pedido" },
          { status: 400 }
        );
      }

      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: "Uno o más productos no están disponibles" },
          { status: 400 }
        );
      }

      normalizedItems.push({ productId: product._id, quantity });
      totalAmount += product.price * quantity;
    }

    const client = getWriteClient();

    const doc = await client.create({
      _type: "order",
      user: {
        _type: "reference",
        _ref: session.user.id,
      },
      customerName: body.customerName.trim(),
      contactPhone: body.contactPhone.trim(),
      orderDate: new Date().toISOString(),
      deliveryMethod,
      deliveryAddress:
        deliveryMethod === "delivery"
          ? body.deliveryAddress?.trim()
          : undefined,
      status: "preparing",
      totalAmount,
      items: normalizedItems.map((item, i) => ({
        _type: "orderItem",
        _key: `item-${i}`,
        product: { _type: "reference", _ref: item.productId },
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({ orderId: doc._id }, { status: 201 });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json(
      { error: "No se pudo crear el pedido" },
      { status: 500 }
    );
  }
}
