import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWriteClient } from "@/lib/sanity";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Tenés que iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const client = getWriteClient();
    const order = await client.fetch<{
      userId?: string;
      paymentMethod?: PaymentMethod;
      paymentStatus?: PaymentStatus;
    } | null>(
      `*[_type == "order" && _id == $id][0]{
        "userId": user._ref,
        paymentMethod,
        paymentStatus
      }`,
      { id }
    );

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (order.paymentMethod === "cash") {
      return NextResponse.json(
        { error: "El efectivo se paga al retirar o al recibir el pedido" },
        { status: 400 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ ok: true, paymentStatus: "paid" });
    }

    await client.patch(id).set({ paymentStatus: "informed" }).commit();
    return NextResponse.json({ ok: true, paymentStatus: "informed" });
  } catch (error) {
    console.error("Error al registrar el pago:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el pago" },
      { status: 500 }
    );
  }
}
