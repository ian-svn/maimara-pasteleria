"use client";

import type { DeliveryMethod, OrderStatus } from "@/lib/types";
import { DELIVERY_STEPS, PICKUP_STEPS } from "@/lib/types";

interface OrderTrackerProps {
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
}

export function OrderTracker({ deliveryMethod, status }: OrderTrackerProps) {
  const steps =
    deliveryMethod === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;

  // Un pedido con retiro nunca debe quedar visualmente en preparación si
  // recibió accidentalmente un estado exclusivo de envío desde el Studio.
  const effectiveStatus =
    deliveryMethod === "pickup" &&
    (status === "on_the_way" || status === "delivered")
      ? "ready"
      : status;
  const currentIndex = steps.findIndex((s) => s.key === effectiveStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <p className="text-sm uppercase tracking-widest text-maimara-primary dark:text-maimara-light">
          {deliveryMethod === "pickup"
            ? "Retiro por el local · Parque Chacabuco"
            : "Envío a domicilio · CABA"}
        </p>
      </div>

      <ol className="relative flex flex-col gap-0 sm:flex-row sm:justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;

          return (
            <li
              key={step.key}
              className="relative flex flex-1 flex-row items-start gap-4 pb-8 last:pb-0 sm:flex-col sm:items-center sm:pb-0 sm:text-center"
            >
              {/* Connector line - vertical on mobile, horizontal on desktop */}
              {index < steps.length - 1 && (
                <>
                  <span
                    className={`absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 sm:left-auto sm:top-5 sm:h-0.5 sm:w-full sm:translate-x-1/2 ${
                      isCompleted ? "bg-maimara-primary" : "bg-neutral-300 dark:bg-maimara-border"
                    }`}
                    aria-hidden
                  />
                </>
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                  isCompleted
                    ? "border-maimara-primary bg-maimara-primary text-white"
                    : isActive
                      ? "border-maimara-primary bg-maimara-primary/15 text-maimara-light ring-4 ring-maimara-primary/25 dark:bg-maimara-primary/20 dark:ring-maimara-primary/30"
                      : "border-maimara-border bg-maimara-elevated text-maimara-muted dark:text-maimara-subtle"
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              <div className="pt-1 sm:pt-4">
                <p
                  className={`text-sm font-semibold ${
                    isPending
                      ? "text-muted"
                      : "text-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="mt-1 text-xs font-medium text-maimara-primary dark:text-maimara-light">
                    Estado actual
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
