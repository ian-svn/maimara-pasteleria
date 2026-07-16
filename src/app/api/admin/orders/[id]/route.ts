import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getWriteClient } from "@/lib/sanity";
import type { DeliveryMethod, OrderStatus } from "@/lib/types";
import { statusesForDelivery } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const status = body.status as OrderStatus;

    if (!status) {
      return NextResponse.json({ error: "Estado requerido" }, { status: 400 });
    }

    const client = getWriteClient();
    const order = await client.fetch<{
      deliveryMethod: DeliveryMethod;
      status: OrderStatus;
    } | null>(
      `*[_type == "order" && _id == $id][0]{ deliveryMethod, status }`,
      { id }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const allowed = statusesForDelivery(order.deliveryMethod).map((s) => s.value);
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido para este método de entrega" },
        { status: 400 }
      );
    }

    await client.patch(id).set({ status }).commit();

    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("Error al actualizar estado:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado" },
      { status: 500 }
    );
  }
}
