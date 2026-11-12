import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ConfirmPaymentButton } from "@/components/ConfirmPaymentButton";
import { OrderAutoRefresh } from "@/components/OrderAutoRefresh";
import { OrderTracker } from "@/components/OrderTracker";
import { formatDeadline } from "@/lib/phone";
import { getOrder } from "@/lib/queries";
import { CONTACT, PAYMENT_METHOD_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

interface TrackingPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackingPage({ params }: TrackingPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/iniciar-sesion?callbackUrl=/mi-cuenta/pedidos");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Pedido no encontrado
        </h1>
        <p className="mt-4 text-muted">
          No encontramos un pedido con el ID{" "}
          <code className="rounded bg-maimara-blush/60 px-2 py-0.5 dark:bg-maimara-surface">
            {id}
          </code>
        </p>
        <Link
          href="/mi-cuenta/pedidos"
          className="mt-6 inline-block text-maimara-primary underline dark:text-maimara-light"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (order.userId !== session.user.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Acceso denegado
        </h1>
        <p className="mt-4 text-muted">
          Este pedido pertenece a otra cuenta.
        </p>
        <Link
          href="/mi-cuenta/pedidos"
          className="mt-6 inline-block text-maimara-primary underline dark:text-maimara-light"
        >
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <OrderAutoRefresh />
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-maimara-primary dark:text-maimara-light">
          Seguimiento de pedido
        </p>
        <h1 className="mt-2 font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Hola, {order.customerName}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Pedido #{order._id.slice(-8).toUpperCase()} ·{" "}
          {formatDate(order.orderDate)}
        </p>
      </div>

      <div className="card-artisan mt-10 p-6 text-center sm:p-8">
        <p className="kicker">Plazo de entrega</p>
        {order.deliveryDeadline ? (
          <p className="mt-3 font-display text-4xl font-semibold capitalize text-maimara-primary dark:text-maimara-light">
            {formatDeadline(order.deliveryDeadline)}
          </p>
        ) : (
          <p className="mt-3 text-muted">
            Todavía no está confirmado. Maimará te va a contactar al{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {order.contactPhone}
            </span>{" "}
            para acordarlo.
          </p>
        )}
        <p className="mt-4 text-sm text-muted">
          {order.deliveryMethod === "pickup"
            ? "Retiro por el local · Parque Chacabuco"
            : `Envío a domicilio${order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}`}
          {order.paymentMethod
            ? ` · ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`
            : ""}
        </p>
      </div>

      <div className="card-artisan mt-6 p-6">
        <h2 className="font-semibold text-neutral-900 dark:text-white">
          Pago
        </h2>
        <div className="mt-3">
          <ConfirmPaymentButton
            orderId={order._id}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
          />
        </div>
      </div>

      <div className="card-artisan mt-6 p-6 sm:p-10">
        <OrderTracker
          deliveryMethod={order.deliveryMethod}
          status={order.status}
        />
      </div>

      <div className="card-artisan mt-6 p-6">
        <h2 className="font-semibold text-neutral-900 dark:text-white">
          Detalle del pedido
        </h2>
        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li
              key={`${item.product._id}-${item.quantity}`}
              className="flex justify-between text-sm text-neutral-700 dark:text-neutral-200"
            >
              <span>
                {item.product.name}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-maimara-blush pt-4 text-right font-bold text-neutral-900 dark:border-maimara-border dark:text-white">
          Total: {formatPrice(order.totalAmount)}
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Consultas? Escribinos por{" "}
        <a
          href={`https://wa.me/${CONTACT.whatsapp}`}
          className="text-maimara-primary underline dark:text-maimara-light"
        >
          WhatsApp
        </a>
      </p>
    </div>
  );
}
