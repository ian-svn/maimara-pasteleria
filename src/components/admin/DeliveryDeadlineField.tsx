"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface DeliveryDeadlineFieldProps {
  orderId: string;
  deliveryDeadline?: string;
}

export function DeliveryDeadlineField({
  orderId,
  deliveryDeadline,
}: DeliveryDeadlineFieldProps) {
  const router = useRouter();
  const [value, setValue] = useState(toLocalInput(deliveryDeadline));
  const [saved, setSaved] = useState(toLocalInput(deliveryDeadline));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (next: string) => {
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryDeadline: next ? new Date(next).toISOString() : null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setValue(saved);
          setError(data.error ?? "No se pudo guardar el plazo");
          return;
        }
        setSaved(next);
        router.refresh();
      } catch {
        setValue(saved);
        setError("Error de conexión");
      }
    });
  };

  return (
    <div className="mt-4">
      <label
        htmlFor={`deadline-${orderId}`}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted"
      >
        Plazo de entrega
      </label>
      <input
        id={`deadline-${orderId}`}
        type="datetime-local"
        value={value}
        disabled={pending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value !== saved) save(value);
        }}
        className="input-field mt-0"
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={pending || value === saved}
          onClick={() => save(value)}
          className="rounded-full bg-maimara-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-maimara-secondary disabled:opacity-40"
        >
          Guardar plazo
        </button>
        <button
          type="button"
          disabled={pending || !value}
          onClick={() => {
            setValue("");
            save("");
          }}
          className="text-xs font-medium text-muted underline disabled:opacity-40"
        >
          Quitar plazo
        </button>
        {pending && (
          <p className="text-xs text-maimara-primary dark:text-maimara-light">
            Guardando...
          </p>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
