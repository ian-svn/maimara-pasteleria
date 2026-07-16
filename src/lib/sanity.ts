import { createClient, type SanityClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-01-01";

export const isSanityConfigured = Boolean(
  projectId && projectId !== "your_project_id"
);

let _client: SanityClient | null = null;

/**
 * Cliente autenticado. El dataset es privado: todas las lecturas
 * y escrituras deben ir con SANITY_API_TOKEN desde el servidor.
 */
export function getClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error("Sanity no está configurado");
  }
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_TOKEN no configurado");
  }
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    });
  }
  return _client;
}

export function getWriteClient(): SanityClient {
  return getClient();
}

/** Solo construye URLs de imagen; no requiere token. */
export function urlFor(source: Image) {
  const builderClient = createClient({
    projectId: projectId || "placeholder",
    dataset,
    apiVersion,
    useCdn: true,
  });
  return imageUrlBuilder(builderClient).image(source);
}
