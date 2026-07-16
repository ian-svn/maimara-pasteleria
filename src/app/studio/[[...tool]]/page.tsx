"use client";

import dynamic from "next/dynamic";
import config from "../../../../sanity.config";

const NextStudio = dynamic(
  () => import("next-sanity/studio").then((mod) => mod.NextStudio),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="font-display text-3xl text-maimara-primary">Maimará</p>
          <p className="mt-2 text-sm text-neutral-500">
            Cargando panel de administración…
          </p>
        </div>
      </div>
    ),
  }
);

export default function StudioPage() {
  return <NextStudio config={config} />;
}
