import { getClient, isSanityConfigured } from "./sanity";
import { mockProducts } from "./mockProducts";
import type { Order, Product } from "./types";

const productProjection = `{
  _id,
  name,
  slug,
  description,
  price,
  category,
  available,
  image
}`;

const orderProjection = `{
  _id,
  customerName,
  contactPhone,
  orderDate,
  deliveryMethod,
  status,
  totalAmount,
  deliveryAddress,
  "userId": user._ref,
  "userEmail": user->email,
  "items": items[] {
    quantity,
    "product": product-> ${productProjection}
  }
}`;

const productsQuery = `*[_type == "product" && available != false] | order(name asc) ${productProjection}`;

const allProductsQuery = `*[_type == "product"] | order(name asc) ${productProjection}`;

const orderQuery = `*[_type == "order" && _id == $id][0] ${orderProjection}`;

const userOrdersQuery = `*[_type == "order" && user._ref == $userId] | order(orderDate desc) ${orderProjection}`;

const allOrdersQuery = `*[_type == "order"] | order(orderDate desc) ${orderProjection}`;

export async function getProducts(): Promise<Product[]> {
  if (!isSanityConfigured) return mockProducts;
  try {
    const products = await getClient().fetch<Product[]>(productsQuery);
    return products.length > 0 ? products : mockProducts;
  } catch {
    return mockProducts;
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSanityConfigured) return null;
  try {
    return await getClient().fetch<Order | null>(
      orderQuery,
      { id },
      { cache: "no-store" }
    );
  } catch {
    return null;
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  if (!isSanityConfigured) return [];
  try {
    return await getClient().fetch<Order[]>(
      userOrdersQuery,
      { userId },
      { cache: "no-store" }
    );
  } catch {
    return [];
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length || !isSanityConfigured) return [];
  return getClient().fetch(
    `*[_type == "product" && _id in $ids && available != false] ${productProjection}`,
    { ids }
  );
}

export async function getAllOrders(): Promise<Order[]> {
  if (!isSanityConfigured) return [];
  try {
    return await getClient().fetch<Order[]>(
      allOrdersQuery,
      {},
      { cache: "no-store" }
    );
  } catch {
    return [];
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isSanityConfigured) return [];
  try {
    return await getClient().fetch<Product[]>(
      allProductsQuery,
      {},
      { cache: "no-store" }
    );
  } catch {
    return [];
  }
}
