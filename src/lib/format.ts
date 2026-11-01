export function formatPrice(amount: number): string {
  return "Rs. " + Math.round(amount).toLocaleString("en-US");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Turns a local number like 0300 1234567 into 923001234567 for WhatsApp links. */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return digits;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Karachi",
  });
}

export function deliveryFor(
  subtotal: number,
  settings: { delivery_fee: number; free_delivery_threshold: number | null }
): number {
  if (subtotal <= 0) return 0;
  if (settings.free_delivery_threshold !== null && subtotal >= settings.free_delivery_threshold) return 0;
  return settings.delivery_fee;
}
