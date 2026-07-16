export type DeliveryMethod = "pickup" | "delivery";

export type PickupStatus = "preparing" | "ready";
export type DeliveryStatus = "preparing" | "ready" | "on_the_way" | "delivered";
export type OrderStatus = PickupStatus | DeliveryStatus;

export interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  description: string;
  price: number;
  category: string;
  available?: boolean;
  image?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  customerName: string;
  contactPhone: string;
  orderDate: string;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress?: string;
  userId?: string;
  userEmail?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  contactPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  items: { productId: string; quantity: number }[];
}

export const CONTACT = {
  phone: "+54 9 11 3241-6973",
  whatsapp: "5491132416973",
  instagram: "@maimara_pasteleria",
  instagramUrl: "https://www.instagram.com/maimara_pasteleria",
  email: "maimara.pasteleria@gmail.com",
  location: "Parque Chacabuco, Buenos Aires",
} as const;

export const PICKUP_STEPS: { key: PickupStatus; label: string }[] = [
  { key: "preparing", label: "En preparación" },
  { key: "ready", label: "Listo para entregar" },
];

export const DELIVERY_STEPS: { key: DeliveryStatus; label: string }[] = [
  { key: "preparing", label: "En preparación" },
  { key: "ready", label: "Listo" },
  { key: "on_the_way", label: "En camino" },
  { key: "delivered", label: "Entregado" },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  preparing: "En preparación",
  ready: "Listo para entregar",
  on_the_way: "En camino",
  delivered: "Entregado",
};

export const PRODUCT_CATEGORIES = [
  { title: "Tortas", value: "tortas" },
  { title: "Tartas", value: "tartas" },
  { title: "Galletitas", value: "galletitas" },
  { title: "Alfajores", value: "alfajores" },
  { title: "Budines", value: "budines" },
  { title: "Mesas dulces", value: "mesas-dulces" },
] as const;

export function statusesForDelivery(
  method: DeliveryMethod
): { value: OrderStatus; label: string }[] {
  if (method === "pickup") {
    return PICKUP_STEPS.map((s) => ({ value: s.key, label: s.label }));
  }
  return DELIVERY_STEPS.map((s) => ({
    value: s.key,
    label: s.key === "ready" ? "Listo" : s.label,
  }));
}
