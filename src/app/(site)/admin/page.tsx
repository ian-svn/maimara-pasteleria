import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeliveryDeadlineField } from "@/components/admin/DeliveryDeadlineField";
import { PaymentStatusSelect } from "@/components/admin/PaymentStatusSelect";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { AdminProductManager } from "@/components/admin/AdminProductManager";
import { formatDeadline, phoneLinks } from "@/lib/phone";
import { getAllOrders, getAllProductsAdmin } from "@/lib/queries";
import { PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

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

function OrdersPanel({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="card-artisan p-8 text-center text-muted">
        Todavía no hay pedidos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const contact = phoneLinks(
          order.contactPhone,
          `Hola ${order.customerName}, soy Maimará. Te escribo para coordinar el plazo de entrega de tu pedido.`
        );
        return (
        <article key={order._id} className="card-artisan p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted">{formatDate(order.orderDate)}</p>
              <h3 className="mt-1 font-display text-3xl font-semibold leading-none text-neutral-900 dark:text-white">
                {order.customerName}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {order.userEmail || "Sin cuenta"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {order.deliveryMethod === "pickup"
                  ? "Retiro por el local"
                  : `Envío · ${order.deliveryAddress || "Sin dirección"}`}
                {order.paymentMethod
                  ? ` · Pago: ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`
                  : ""}
              </p>

              <div className="mt-4 rounded-2xl border border-maimara-blush bg-maimara-cream px-4 py-3 dark:border-maimara-border dark:bg-maimara-carbon">
                <p className="text-xs font-semibold uppercase tracking-widest text-maimara-primary dark:text-maimara-light">
                  Teléfono para coordinar
                </p>
                <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                  {order.contactPhone}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {contact.tel && (
                    <a
                      href={contact.tel}
                      className="rounded-full bg-maimara-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-maimara-secondary"
                    >
                      Llamar
                    </a>
                  )}
                  {contact.whatsapp && (
                    <a
                      href={contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-maimara-primary px-4 py-2 text-sm font-semibold text-maimara-primary transition hover:bg-white dark:border-maimara-light dark:text-maimara-light"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
                {order.deliveryDeadline && (
                  <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-200">
                    Plazo asignado: {formatDeadline(order.deliveryDeadline)}
                  </p>
                )}
              </div>

              <ul className="mt-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                {order.items.map((item) => (
                  <li key={`${order._id}-${item.product._id}`}>
                    {item.product.name}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-bold text-maimara-primary dark:text-maimara-light">
                {formatPrice(order.totalAmount)}
              </p>
            </div>

            <div className="w-full shrink-0 lg:w-64">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Estado del pedido
              </p>
              <OrderStatusSelect
                orderId={order._id}
                deliveryMethod={order.deliveryMethod}
                status={order.status}
              />
              <DeliveryDeadlineField
                orderId={order._id}
                deliveryDeadline={order.deliveryDeadline}
              />
              <PaymentStatusSelect
                orderId={order._id}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </div>
        </article>
        );
      })}
    </div>
  );
}

interface AdminPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  const { tab } = await searchParams;
  const activeTab = tab === "productos" ? "productos" : "pedidos";

  const [orders, products] = await Promise.all([
    getAllOrders(),
    getAllProductsAdmin(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-maimara-primary dark:text-maimara-light">
          Panel de administración
        </p>
        <h1 className="mt-2 font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Gestión Maimará
        </h1>
        <p className="mt-2 text-muted">
          Hola {session.user.name || "Admin"}. Coordiná cada pedido por teléfono
          y asigná el plazo de entrega cuando lo acuerdes.
        </p>
      </div>

      <div className="mb-8 flex gap-2 border-b border-maimara-blush dark:border-maimara-border">
        <Link
          href="/admin?tab=pedidos"
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "pedidos"
              ? "border-maimara-primary text-maimara-primary dark:border-maimara-light dark:text-maimara-light"
              : "border-transparent text-muted hover:text-maimara-primary"
          }`}
        >
          Pedidos ({orders.length})
        </Link>
        <Link
          href="/admin?tab=productos"
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
            activeTab === "productos"
              ? "border-maimara-primary text-maimara-primary dark:border-maimara-light dark:text-maimara-light"
              : "border-transparent text-muted hover:text-maimara-primary"
          }`}
        >
          Productos ({products.length})
        </Link>
      </div>

      {activeTab === "pedidos" ? (
        <OrdersPanel orders={orders} />
      ) : (
        <AdminProductManager products={products} />
      )}
    </div>
  );
}
