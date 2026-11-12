"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/types";

const options: PaymentStatus[] = ["pending", "informed", "paid"];

export function PaymentStatusSelect({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus?: PaymentStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<PaymentStatus>(paymentStatus ?? "pending");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (next: PaymentStatus) => {
    const previous = value;
    setValue(next);
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: next }),
        });
        const data = await res.json();
        if (!res.ok) {
          setValue(previous);
          setError(data.error ?? "No se pudo guardar el pago");
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
    <div className="mt-4">
      <label
        htmlFor={`pay-${orderId}`}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted"
      >
        Estado del pago
      </label>
      <select
        id={`pay-${orderId}`}
        value={value}
        disabled={pending}
        onChange={(e) => save(e.target.value as PaymentStatus)}
        className="w-full cursor-pointer rounded-xl border border-maimara-blush bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 outline-none dark:border-maimara-border dark:bg-maimara-input dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {PAYMENT_STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
