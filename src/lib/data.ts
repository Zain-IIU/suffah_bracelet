import { createPublicClient } from "./supabase/public";
import { PRODUCT_SELECT, normalizeProduct, normalizeSettings } from "./products";
import type { Category, Product, Settings } from "./types";

/** Public data for the shop. Only visible products are returned (security rules). */

export async function getProducts(opts: { categorySlug?: string; limit?: number } = {}): Promise<Product[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts.categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", opts.categorySlug).maybeSingle();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) {
    console.error("getProducts", error.message);
    return [];
  }
  return ((data ?? []) as unknown[]).map(normalizeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []) as Category[];
}

export async function getSettings(): Promise<Settings> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return normalizeSettings(data);
}
