"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/types";

interface ConfirmPaymentButtonProps {
  orderId: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export function ConfirmPaymentButton({
  orderId,
  paymentMethod,
  paymentStatus,
}: ConfirmPaymentButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus | undefined>(paymentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!paymentMethod) return null;

  if (paymentMethod === "cash") {
    return (
      <p className="text-sm text-muted">
        Pagás en efectivo cuando retirás o cuando llega el pedido.
      </p>
    );
  }

  if (status === "paid") {
    return (
      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        Pago confirmado por Maimará.
      </p>
    );
  }

  if (status === "informed") {
    return (
      <p className="text-sm text-neutral-800 dark:text-neutral-100">
        Avisaste que pagaste. Maimará lo confirma cuando lo ve.
      </p>
    );
  }

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo registrar el pago");
      setStatus("informed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="rounded-full bg-maimara-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-maimara-secondary disabled:opacity-60"
      >
        {loading ? "Registrando..." : "Ya pagué"}
      </button>
      <p className="mt-2 text-xs text-muted">
        {paymentMethod === "transfer"
          ? "Después de transferir, tocá el botón para avisar."
          : "Después de pagar con Mercado Pago, tocá el botón para avisar."}{" "}
        Estado: {PAYMENT_STATUS_LABELS[status ?? "pending"]}.
      </p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
