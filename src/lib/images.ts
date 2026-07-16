import type { Product } from "./types";
import { isSanityConfigured, urlFor } from "./sanity";

export function getProductImageUrl(product: Product): string | null {
  if (!product.image || !isSanityConfigured) return null;
  try {
    return urlFor(product.image as Parameters<typeof urlFor>[0])
      .width(400)
      .height(300)
      .url();
  } catch {
    return null;
  }
}
