"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DeliveryMethod, OrderStatus } from "@/lib/types";
import { statusesForDelivery } from "@/lib/types";

interface OrderStatusSelectProps {
  orderId: string;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
}

export function OrderStatusSelect({
  orderId,
  deliveryMethod,
  status,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const options = statusesForDelivery(deliveryMethod);

  const handleChange = (next: OrderStatus) => {
    const previous = value;
    setValue(next);
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        const data = await res.json();
        if (!res.ok) {
          setValue(previous);
          setError(data.error ?? "No se pudo guardar");
          return;
        }
        router.refresh();
      } catch {
        setValue(previous);
        setError("Error de conexión");
      }
    });
  };

  return (
    <div className="min-w-[200px]">
      <label className="sr-only" htmlFor={`status-${orderId}`}>
        Estado del pedido
      </label>
      <select
        id={`status-${orderId}`}
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="w-full cursor-pointer rounded-xl border border-maimara-blush bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 outline-none transition focus:border-maimara-primary focus:ring-2 focus:ring-maimara-primary/25 disabled:opacity-60 dark:border-maimara-border dark:bg-maimara-input dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {pending && (
        <p className="mt-1 text-xs text-maimara-primary dark:text-maimara-light">
          Guardando...
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
