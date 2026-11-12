import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getWriteClient } from "@/lib/sanity";
import type { DeliveryMethod, OrderStatus, PaymentStatus } from "@/lib/types";
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
    const status = body.status as OrderStatus | undefined;
    const hasStatus = typeof status === "string" && status.length > 0;
    const hasDeadline = Object.prototype.hasOwnProperty.call(
      body,
      "deliveryDeadline"
    );
    const paymentStatus = body.paymentStatus as PaymentStatus | undefined;
    const hasPayment =
      paymentStatus === "pending" ||
      paymentStatus === "informed" ||
      paymentStatus === "paid";

    if (!hasStatus && !hasDeadline && !hasPayment) {
      return NextResponse.json(
        { error: "Nada para actualizar" },
        { status: 400 }
      );
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

    if (hasStatus) {
      const allowed = statusesForDelivery(order.deliveryMethod).map(
        (s) => s.value
      );
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: "Estado inválido para este método de entrega" },
          { status: 400 }
        );
      }
    }

    let deliveryDeadline: string | null = null;
    if (hasDeadline && body.deliveryDeadline) {
      const parsed = new Date(String(body.deliveryDeadline));
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Plazo de entrega inválido" },
          { status: 400 }
        );
      }
      deliveryDeadline = parsed.toISOString();
    }

    const set: Record<string, string> = {};
    if (hasStatus && status) set.status = status;
    if (hasDeadline && deliveryDeadline) set.deliveryDeadline = deliveryDeadline;
    if (hasPayment && paymentStatus) set.paymentStatus = paymentStatus;

    const patch = client.patch(id);
    if (Object.keys(set).length > 0) patch.set(set);
    if (hasDeadline && !deliveryDeadline) patch.unset(["deliveryDeadline"]);
    await patch.commit();

    return NextResponse.json({
      ok: true,
      status: hasStatus ? status : order.status,
      deliveryDeadline,
    });
  } catch (err) {
    console.error("Error al actualizar estado:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado" },
      { status: 500 }
    );
  }
}
