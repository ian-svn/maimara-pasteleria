import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/queries";
import { STATUS_LABELS, type Order } from "@/lib/types";

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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="card-artisan p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{formatDate(order.orderDate)}</p>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
            Pedido #{order._id.slice(-8).toUpperCase()}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {order.deliveryMethod === "pickup"
              ? "Retiro por el local"
              : "Envío a CABA"}
            {" · "}
            {STATUS_LABELS[order.status] ?? order.status}
          </p>
        </div>
        <p className="text-lg font-bold text-maimara-primary dark:text-maimara-light">
          {formatPrice(order.totalAmount)}
        </p>
      </div>

      <ul className="mt-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        {order.items.map((item) => (
          <li key={`${order._id}-${item.product._id}`}>
            {item.product.name}
            {item.quantity > 1 ? ` × ${item.quantity}` : ""}
          </li>
        ))}
      </ul>

      <Link
        href={`/tracking/${order._id}`}
        className="mt-5 inline-block rounded-full bg-maimara-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-maimara-secondary"
      >
        Ver seguimiento
      </Link>
    </article>
  );
}

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/iniciar-sesion?callbackUrl=/mi-cuenta/pedidos");
  }

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-maimara-primary dark:text-maimara-light">
          Mi cuenta
        </p>
        <h1 className="mt-2 font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Mis pedidos
        </h1>
        <p className="mt-2 text-muted">
          Hola{session.user.name ? `, ${session.user.name}` : ""}. Acá están
          todos los pedidos de {session.user.email}.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card-artisan p-8 text-center">
          <p className="text-muted">Todavía no hiciste ningún pedido.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-maimara-primary px-6 py-3 font-medium text-white transition hover:bg-maimara-secondary"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
