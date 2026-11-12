import Image from "next/image";
import { FloralEdge } from "@/components/FloralEdge";
import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";
import { CONTACT } from "@/lib/types";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      <section className="brand-hero relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <div className="relative mx-auto max-w-3xl text-center">
          <FloralEdge />
          <Image
            src="/images/logo.png"
            alt="Maimará Pastelería Artesanal"
            width={1514}
            height={1049}
            priority
            className="mx-auto mt-6 h-auto w-64 sm:w-80"
          />
          <p className="kicker mt-6">Mesas dulces & tortas de diseño</p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-700 dark:text-neutral-200 sm:text-lg">
            Pastelería rica y artesanal en Parque Chacabuco. Tartas,
            galletitas decoradas y pedidos para llevar o con envío a CABA.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#menu"
              className="rounded-full bg-maimara-primary px-7 py-3 text-sm font-semibold text-white shadow-[var(--shadow-artisan)] transition hover:bg-maimara-secondary"
            >
              Ver el menú
            </a>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-maimara-primary px-7 py-3 text-sm font-semibold text-maimara-primary transition hover:bg-white/70 dark:border-maimara-light dark:text-maimara-light dark:hover:bg-white/5"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section
        id="menu"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mb-10 text-center">
          <FloralEdge className="mb-4" />
          <h2 className="font-display text-5xl font-semibold text-maimara-primary dark:text-maimara-light">
            Nuestro menú
          </h2>
          <p className="mt-2 text-muted">
            Hecho a pedido en {CONTACT.location}. El plazo de entrega se
            coordina por teléfono después de confirmar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
