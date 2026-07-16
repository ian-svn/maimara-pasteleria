import { ProductCard } from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-maimara-primary via-maimara-secondary to-maimara-light px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl sm:text-7xl">Maimará</h1>
          <p className="mt-2 text-sm tracking-[0.3em] uppercase opacity-90">
            Pastelería Artesanal
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg opacity-95">
            Mesas dulces · Tortas de diseño · Tartas · Galletitas decoradas
          </p>
        </div>
      </section>

      {/* Catálogo */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
            Nuestro menú
          </h2>
          <p className="mt-2 text-muted">
            Productos artesanales hechos con amor en Parque Chacabuco
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
