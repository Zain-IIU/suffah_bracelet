"use server";

import { z } from "zod";
import { formatPrice } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";

export type PlaceOrderState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "address" | "city" | "postal_code" | "gift_note", string>>;
  orderNumber?: string;
  total?: number;
  /** What the customer typed, so the form can refill itself after an error. */
  values?: Record<string, string>;
};

const FIELD_NAMES = ["name", "phone", "email", "address", "city", "postal_code", "gift_note"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const orderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80, "Name is too long."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .refine((v) => /^\+?\d{10,15}$/.test(v), "Enter a valid mobile number, e.g. 0300 1234567."),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email or leave it blank."),
  address: z.string().trim().min(8, "Please enter your full address.").max(300, "Address is too long."),
  city: z.string().trim().min(2, "Please enter your city.").max(60),
  postal_code: optionalText(12),
  gift_note: optionalText(300),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your bag is empty.")
    .max(30),
});

export async function placeOrder(_prev: PlaceOrderState, formData: FormData): Promise<PlaceOrderState> {
  const values: Record<string, string> = {};
  for (const f of FIELD_NAMES) values[f] = String(formData.get(f) ?? "").slice(0, 400);

  // Honeypot: real people never fill this hidden field.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { ok: false, message: "Something went wrong. Please try again.", values };
  }

  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    items = [];
  }

  const parsed = orderSchema.safeParse({ ...values, items });

  if (!parsed.success) {
    const fieldErrors: PlaceOrderState["fieldErrors"] = {};
    let message = "Please check the highlighted fields.";
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "items") {
        message = "Your bag is empty or has a problem. Please review it.";
      } else if (typeof key === "string" && !(key in fieldErrors)) {
        (fieldErrors as Record<string, string>)[key] = issue.message;
      }
    }
    return { ok: false, message, fieldErrors, values };
  }

  const d = parsed.data;
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: d.name,
    p_phone: d.phone,
    p_email: d.email || null,
    p_address: d.address,
    p_city: d.city,
    p_postal_code: d.postal_code ?? null,
    p_gift_note: d.gift_note ?? null,
    p_items: d.items,
  });

  if (error || !data) {
    console.error("place_order failed", error);
    // Messages raised inside place_order (code P0001) are written for customers.
    const message =
      error?.code === "P0001" && error.message
        ? error.message
        : "We couldn't place your order just now. Please try again in a moment.";
    return { ok: false, message, values };
  }

  const result = data as { order_number: string; total: number };

  await sendOrderAlert({
    orderNumber: result.order_number,
    total: result.total,
    name: d.name,
    phone: d.phone,
    city: d.city,
    itemCount: d.items.reduce((n, i) => n + i.quantity, 0),
  });

  return { ok: true, orderNumber: result.order_number, total: result.total };
}

/** Optional email alert via Resend. Silently skipped if not configured; never blocks the order. */
async function sendOrderAlert(o: {
  orderNumber: string;
  total: number;
  name: string;
  phone: string;
  city: string;
  itemCount: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_ALERT_EMAIL;
  if (!apiKey || !to) return;

  const site = SITE_URL;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Suffah Orders <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        subject: `New order ${o.orderNumber} · ${formatPrice(o.total)}`,
        html: `<p><strong>New order ${esc(o.orderNumber)}</strong></p>
<p>${esc(o.name)} · ${esc(o.phone)} · ${esc(o.city)}<br>${o.itemCount} item(s) · ${esc(formatPrice(o.total))}</p>
<p><a href="${esc(site)}/admin/orders">Open orders in the admin</a></p>`,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("Order alert email failed", e);
  }
}
