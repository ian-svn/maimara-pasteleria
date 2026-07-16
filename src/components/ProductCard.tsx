"use client";

import Image from "next/image";
import { getProductImageUrl } from "@/lib/images";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

const categoryLabels: Record<string, string> = {
  tortas: "Tortas",
  tartas: "Tartas",
  galletitas: "Galletitas",
  alfajores: "Alfajores",
  budines: "Budines",
  "mesas-dulces": "Mesas dulces",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const imageUrl = getProductImageUrl(product);

  return (
    <article className="card-artisan group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-artisan)] dark:hover:border-maimara-light/40">
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-maimara-blush/40 to-maimara-light/30 dark:from-maimara-primary/25 dark:to-maimara-charcoal">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="font-display text-5xl text-maimara-primary/50 transition group-hover:scale-110 group-hover:text-maimara-primary/80 dark:text-maimara-light/40 dark:group-hover:text-maimara-light/60">
            {product.name.charAt(0)}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-maimara-primary/90 px-2.5 py-0.5 text-xs font-medium text-white">
          {categoryLabels[product.category] ?? product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl text-maimara-primary dark:text-maimara-light">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="rounded-full bg-maimara-primary px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-artisan)] transition hover:bg-maimara-secondary active:scale-95"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
