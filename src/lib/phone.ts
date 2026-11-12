/** Normaliza un teléfono argentino al formato de WhatsApp (549...). */
export function toWhatsAppNumber(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("549") && digits.length >= 12) return digits;
  if (digits.startsWith("54")) {
    const rest = digits.slice(2);
    return rest.startsWith("9") ? `54${rest}` : `549${rest}`;
  }

  if (digits.startsWith("0")) digits = digits.slice(1);

  // 15 3114 4721 (móvil de CABA sin código de área)
  if (digits.startsWith("15") && digits.length >= 10) {
    return `54911${digits.slice(2)}`;
  }

  // 11 15 3114 4721
  if (digits.length >= 12 && digits.slice(2, 4) === "15") {
    return `549${digits.slice(0, 2)}${digits.slice(4)}`;
  }

  return `549${digits}`;
}

export function phoneLinks(raw: string, message?: string) {
  const wa = toWhatsAppNumber(raw);
  const tel = wa ? `tel:+${wa}` : undefined;
  const whatsapp = wa
    ? `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}`
    : undefined;
  return { tel, whatsapp };
}

export function formatDeadline(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(iso));
}
