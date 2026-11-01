"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/format";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import { ORDER_STATUSES } from "@/lib/types";

/** Refresh every shop page so admin changes show up straight away. */
function refreshShop() {
  revalidatePath("/", "layout");
}

/* ---------------------------------- Orders --------------------------------- */

const orderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
  admin_notes: z.string().max(2000).optional(),
});

export async function updateOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = orderUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    admin_notes: String(formData.get("admin_notes") ?? ""),
  });
  if (!parsed.success) redirect(`/admin/orders?error=invalid`);

  const { id, status, admin_notes } = parsed.data;
  const { error } = await supabase
    .from("orders")
    .update({ status, admin_notes: admin_notes?.trim() || null })
    .eq("id", id);

  revalidatePath("/admin", "layout");
  redirect(`/admin/orders/${id}?${error ? "error=save" : "saved=1"}`);
}

/* --------------------------------- Products -------------------------------- */

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

const imagePathRe = /^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp|gif|avif)$/i;

const productSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(2, "Give the bracelet a name.").max(100),
    slug: z.string().trim().max(80).optional(),
    description: z.string().trim().max(3000).default(""),
    category_id: z.string().uuid().nullable(),
    price: z.coerce.number().int("Use whole rupees.").min(1, "Enter a price.").max(10_000_000),
    sale_price: z.coerce.number().int("Use whole rupees.").min(0).max(10_000_000).nullable(),
    tag: z.string().trim().max(30).nullable(),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    in_stock: z.boolean(),
    sort_order: z.coerce.number().int().min(-10000).max(10000).default(0),
    images: z
      .array(z.object({ path: z.string().regex(imagePathRe), alt: z.string().max(200).default("") }))
      .max(12, "Up to 12 photos per bracelet."),
  })
  .refine((d) => d.sale_price === null || d.sale_price < d.price, {
    message: "Sale price must be lower than the regular price.",
    path: ["sale_price"],
  });

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const { supabase } = await requireAdmin();

  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }

  const parsed = productSchema.safeParse({
    id: emptyToNull(formData.get("id")) ?? undefined,
    name: formData.get("name") ?? "",
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    category_id: emptyToNull(formData.get("category_id")),
    price: emptyToNull(formData.get("price")) ?? "",
    sale_price: emptyToNull(formData.get("sale_price")),
    tag: emptyToNull(formData.get("tag")),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    in_stock: formData.get("in_stock") === "on",
    sort_order: emptyToNull(formData.get("sort_order")) ?? 0,
    images,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const d = parsed.data;
  const slug = slugify(d.slug || d.name) || `bracelet-${Date.now()}`;
  const row = {
    name: d.name,
    slug,
    description: d.description,
    category_id: d.category_id,
    price: d.price,
    sale_price: d.sale_price,
    tag: d.tag,
    is_active: d.is_active,
    is_featured: d.is_featured,
    in_stock: d.in_stock,
    sort_order: d.sort_order,
  };

  let productId = d.id;
  if (productId) {
    const { error } = await supabase.from("products").update(row).eq("id", productId);
    if (error) return productError(error);
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error || !data) return productError(error);
    productId = data.id as string;
  }

  // Replace the photo list and delete files that were removed.
  const { data: oldImages } = await supabase.from("product_images").select("path").eq("product_id", productId);
  const keep = new Set(d.images.map((i) => i.path));
  const removed = ((oldImages ?? []) as { path: string }[]).map((i) => i.path).filter((p) => !keep.has(p));

  const { error: delErr } = await supabase.from("product_images").delete().eq("product_id", productId);
  if (delErr) return { error: `Saved, but photos couldn't be updated: ${delErr.message}` };
  if (d.images.length > 0) {
    const { error: imgErr } = await supabase.from("product_images").insert(
      d.images.map((img, position) => ({ product_id: productId, path: img.path, alt: img.alt, position }))
    );
    if (imgErr) return { error: `Saved, but photos couldn't be updated: ${imgErr.message}` };
  }
  if (removed.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(removed);
  }

  refreshShop();
  revalidatePath("/admin", "layout");
  redirect(`/admin/products/${productId}?saved=1`);
}

function productError(error: { code?: string; message?: string } | null): ProductFormState {
  if (error?.code === "23505") {
    return {
      error: "Another bracelet already uses this web address.",
      fieldErrors: { slug: "Choose a different web address (slug)." },
    };
  }
  return { error: `Couldn't save: ${error?.message ?? "unknown error"}` };
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/products");

  const { data: imgs } = await supabase.from("product_images").select("path").eq("product_id", id.data);
  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) redirect(`/admin/products/${id.data}?error=delete`);

  const paths = ((imgs ?? []) as { path: string }[]).map((i) => i.path);
  if (paths.length > 0) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);

  refreshShop();
  revalidatePath("/admin", "layout");
  redirect("/admin/products?deleted=1");
}

export async function toggleProductVisibility(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  await supabase.from("products").update({ is_active: next }).eq("id", id);
  refreshShop();
  revalidatePath("/admin/products");
}

/* --------------------------------- Settings -------------------------------- */

const settingsSchema = z.object({
  delivery_fee: z.coerce.number().int().min(0).max(100000),
  free_delivery_threshold: z.coerce.number().int().min(0).max(10_000_000).nullable(),
  announcement: z.string().trim().max(160),
  whatsapp_number: z.string().trim().max(20),
  contact_email: z.string().trim().max(120),
  instagram_url: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^https?:\/\//.test(v), "Start the link with https://"),
});

export async function saveSettings(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    delivery_fee: emptyToNull(formData.get("delivery_fee")) ?? 0,
    free_delivery_threshold: emptyToNull(formData.get("free_delivery_threshold")),
    announcement: String(formData.get("announcement") ?? ""),
    whatsapp_number: String(formData.get("whatsapp_number") ?? ""),
    contact_email: String(formData.get("contact_email") ?? ""),
    instagram_url: String(formData.get("instagram_url") ?? ""),
  });
  if (!parsed.success) {
    redirect(`/admin/settings?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "invalid")}`);
  }
  const { error } = await supabase.from("settings").update(parsed.data).eq("id", 1);
  refreshShop();
  redirect(`/admin/settings?${error ? `error=${encodeURIComponent(error.message)}` : "saved=1"}`);
}

export async function addCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim().slice(0, 40);
  if (name.length < 2) redirect("/admin/settings?error=Category%20name%20is%20too%20short");
  const { count } = await supabase.from("categories").select("id", { count: "exact", head: true });
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name) || `category-${Date.now()}`, sort_order: (count ?? 0) + 1 });
  refreshShop();
  redirect(
    `/admin/settings?${
      error ? `error=${encodeURIComponent(error.code === "23505" ? "That category already exists" : error.message)}` : "saved=1"
    }#categories`
  );
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (id.success) await supabase.from("categories").delete().eq("id", id.data);
  refreshShop();
  redirect("/admin/settings?saved=1#categories");
}
