"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { DeliveryMethod } from "@/lib/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, totalAmount, clearCart } =
    useCart();
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");
  const [customerName, setCustomerName] = useState(
    session?.user?.name ?? ""
  );
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          contactPhone,
          deliveryMethod,
          deliveryAddress:
            deliveryMethod === "delivery" ? deliveryAddress : undefined,
          items: items.map(({ product, quantity }) => ({
            productId: product._id,
            quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al confirmar el pedido");
      }

      setOrderId(data.orderId);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Carrito vacío
        </h1>
        <p className="mt-4 text-muted">
          Agregá productos desde el catálogo para continuar.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-maimara-primary px-6 py-3 font-medium text-white transition hover:bg-maimara-secondary"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="card-artisan p-8">
          <span className="text-4xl">🎂</span>
          <h1 className="mt-4 font-display text-4xl text-maimara-primary dark:text-maimara-light">
            ¡Pedido recibido!
          </h1>
          <p className="mt-3 text-muted">
            Gracias {customerName}. Te contactaremos pronto para confirmar tu
            pedido.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/tracking/${orderId}`}
              className="inline-block rounded-full bg-maimara-primary px-6 py-3 font-medium text-white transition hover:bg-maimara-secondary"
            >
              Seguir mi pedido
            </Link>
            <Link
              href="/mi-cuenta/pedidos"
              className="inline-block rounded-full border border-maimara-primary px-6 py-3 font-medium text-maimara-primary transition hover:bg-maimara-primary/5 dark:border-maimara-light dark:text-maimara-light"
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
        Checkout
      </h1>
      <p className="mt-1 text-muted">
        Sesión: {session?.user?.email}. Completá tus datos para confirmar el
        pedido.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card-artisan p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Tu pedido
          </h2>
          <ul className="mt-4 divide-y divide-maimara-blush dark:divide-maimara-border">
            {items.map(({ product, quantity }) => (
              <li key={product._id} className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted">
                    {formatPrice(product.price)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product._id, quantity - 1)}
                    className="btn-qty"
                    aria-label="Quitar uno"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium text-neutral-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product._id, quantity + 1)}
                    className="btn-qty"
                    aria-label="Agregar uno"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(product._id)}
                  className="shrink-0 text-sm font-medium text-maimara-primary hover:text-maimara-secondary dark:text-maimara-light"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-maimara-blush pt-4 text-right text-xl font-bold text-neutral-900 dark:border-maimara-border dark:text-white">
            Total: {formatPrice(totalAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-artisan space-y-6 p-6">
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="customerName" className="label-field">
              Nombre
            </label>
            <input
              id="customerName"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="label-field">
              Teléfono
            </label>
            <input
              id="contactPhone"
              required
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="input-field"
              placeholder="+54 9 11 ..."
            />
          </div>

          <fieldset>
            <legend className="label-field">Método de entrega</legend>
            <div className="mt-3 space-y-3">
              <label className="option-card">
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={() => setDeliveryMethod("pickup")}
                  className="mt-1 accent-maimara-primary"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    Retiro por el local
                  </p>
                  <p className="text-sm text-muted">
                    Parque Chacabuco, Buenos Aires
                  </p>
                </div>
              </label>
              <label className="option-card">
                <input
                  type="radio"
                  name="delivery"
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={() => setDeliveryMethod("delivery")}
                  className="mt-1 accent-maimara-primary"
                />
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    Envío a CABA
                  </p>
                  <p className="text-sm text-muted">
                    Costo de envío adicional
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          {deliveryMethod === "delivery" && (
            <div>
              <label htmlFor="deliveryAddress" className="label-field">
                Dirección de entrega
              </label>
              <input
                id="deliveryAddress"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="input-field"
                placeholder="Calle, número, barrio"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-maimara-primary py-3.5 text-base font-semibold text-white shadow-[var(--shadow-artisan)] transition hover:bg-maimara-secondary active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? "Enviando pedido..."
              : `Confirmar pedido · ${formatPrice(totalAmount)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
