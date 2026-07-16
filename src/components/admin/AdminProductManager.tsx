"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getProductImageUrl } from "@/lib/images";
import { PRODUCT_CATEGORIES, type Product } from "@/lib/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

export function AdminProductManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("tortas");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("tortas");
    setAvailable(true);
    setImageFile(null);
    setPreview(null);
  };

  const handleImage = (file: File | null) => {
    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const form = new FormData();
      form.set("name", name);
      form.set("description", description);
      form.set("price", price);
      form.set("category", category);
      form.set("available", available ? "true" : "false");
      if (imageFile) form.set("image", imageFile);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear");

      setMessage("Producto publicado correctamente");
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product: Product) => {
    const form = new FormData();
    form.set("name", product.name);
    form.set("description", product.description || "");
    form.set("price", String(product.price));
    form.set("category", product.category);
    form.set("available", product.available === false ? "true" : "false");

    const res = await fetch(`/api/admin/products/${product._id}`, {
      method: "PATCH",
      body: form,
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="card-artisan space-y-5 p-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Subir producto
          </h2>
          <p className="mt-1 text-sm text-muted">
            Completá los datos y, si querés, agregá una foto. Se publica al
            instante en el catálogo.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className="label-field">
              Nombre
            </label>
            <input
              id="product-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej. Torta Matilda"
            />
          </div>

          <div>
            <label htmlFor="product-price" className="label-field">
              Precio (ARS)
            </label>
            <input
              id="product-price"
              required
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
              placeholder="70000"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="label-field">
              Categoría
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-description" className="label-field">
              Descripción
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-y"
              placeholder="Medidas, porciones, variantes..."
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-image" className="label-field">
              Foto del producto
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
              className="mt-1.5 block w-full text-sm text-neutral-600 file:mr-4 file:rounded-full file:border-0 file:bg-maimara-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-maimara-secondary dark:text-neutral-300"
            />
            {preview && (
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl border border-maimara-blush dark:border-maimara-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="accent-maimara-primary"
            />
            Visible en el catálogo
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-maimara-primary px-6 py-3 font-semibold text-white transition hover:bg-maimara-secondary disabled:opacity-60"
        >
          {loading ? "Subiendo..." : "Publicar producto"}
        </button>
      </form>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Productos ({products.length})
        </h2>
        <div className="space-y-3">
          {products.map((product) => {
            const imageUrl = getProductImageUrl(product);
            return (
              <article
                key={product._id}
                className="card-artisan flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-maimara-blush/40 dark:bg-maimara-input">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-2xl text-maimara-primary/50">
                      {product.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted">
                    {formatPrice(product.price)} · {product.category}
                    {product.available === false ? " · Oculto" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAvailability(product)}
                  className="rounded-full border border-maimara-blush px-4 py-2 text-sm font-medium transition hover:bg-maimara-cream dark:border-maimara-border dark:hover:bg-maimara-input"
                >
                  {product.available === false ? "Mostrar" : "Ocultar"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
