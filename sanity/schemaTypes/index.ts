import { defineField, defineType } from "sanity";

export const user = defineType({
  name: "user",
  title: "Usuario",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
    }),
    defineField({
      name: "passwordHash",
      title: "Hash de contraseña",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "role",
      title: "Rol",
      type: "string",
      options: {
        list: [
          { title: "Cliente", value: "customer" },
          { title: "Administrador", value: "admin" },
        ],
      },
      initialValue: "customer",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      title: "Fecha de registro",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "email", subtitle: "role" },
  },
});

export const product = defineType({
  name: "product",
  title: "Producto",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Precio (ARS)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      options: {
        list: [
          { title: "Tortas", value: "tortas" },
          { title: "Tartas", value: "tartas" },
          { title: "Galletitas", value: "galletitas" },
          { title: "Alfajores", value: "alfajores" },
          { title: "Budines", value: "budines" },
          { title: "Mesas dulces", value: "mesas-dulces" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "available",
      title: "Disponible para venta",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "image" },
  },
});

export const orderItem = defineType({
  name: "orderItem",
  title: "Ítem de pedido",
  type: "object",
  fields: [
    defineField({
      name: "product",
      title: "Producto",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "quantity",
      title: "Cantidad",
      type: "number",
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "product.name", quantity: "quantity" },
    prepare({ title, quantity }) {
      return { title: `${title ?? "Producto"} × ${quantity ?? 1}` };
    },
  },
});

export const order = defineType({
  name: "order",
  title: "Pedido",
  type: "document",
  fields: [
    defineField({
      name: "user",
      title: "Usuario",
      type: "reference",
      to: [{ type: "user" }],
      // Los pedidos nuevos siempre lo envían desde la API.
      // Los antiguos pueden no tener dueño.
    }),
    defineField({
      name: "customerName",
      title: "Nombre del cliente",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "contactPhone",
      title: "Teléfono de contacto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderDate",
      title: "Fecha del pedido",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "items",
      title: "Productos",
      type: "array",
      of: [{ type: "orderItem" }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "deliveryMethod",
      title: "Método de entrega",
      type: "string",
      options: {
        list: [
          { title: "Retiro por el local", value: "pickup" },
          { title: "Envío a domicilio", value: "delivery" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deliveryAddress",
      title: "Dirección de entrega",
      type: "string",
      hidden: ({ document }) => document?.deliveryMethod !== "delivery",
    }),
    defineField({
      name: "status",
      title: "Estado del pedido",
      type: "string",
      options: {
        list: [
          { title: "En preparación", value: "preparing" },
          { title: "Listo para entregar / Listo", value: "ready" },
          { title: "En camino (solo envío)", value: "on_the_way" },
          { title: "Entregado (solo envío)", value: "delivered" },
        ],
      },
      initialValue: "preparing",
      validation: (Rule) =>
        Rule.required().custom((status, context) => {
          const deliveryMethod = context.document?.deliveryMethod;
          if (
            deliveryMethod === "pickup" &&
            (status === "on_the_way" || status === "delivered")
          ) {
            return 'Para retiro solo se permite "En preparación" o "Listo para entregar".';
          }
          return true;
        }),
    }),
    defineField({
      name: "totalAmount",
      title: "Monto total (ARS)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "deliveryMethod",
      status: "status",
      date: "orderDate",
    },
    prepare({ title, subtitle, status, date }) {
      return {
        title: title ?? "Sin nombre",
        subtitle: `${subtitle === "pickup" ? "Retiro" : "Envío"} · ${status ?? ""} · ${date ? new Date(date).toLocaleDateString("es-AR") : ""}`,
      };
    },
  },
});

export const schemaTypes = [user, product, orderItem, order];
