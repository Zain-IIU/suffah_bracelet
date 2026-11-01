import { PRODUCT_IMAGES_BUCKET, SUPABASE_URL } from "./supabase/env";
import type { Category, Product, ProductImage, Settings } from "./types";

export const PRODUCT_SELECT =
  "id, name, slug, description, category_id, price, sale_price, tag, is_active, is_featured, in_stock, sort_order, category:categories(id, name, slug, sort_order), images:product_images(id, path, alt, position)";

export const DEFAULT_SETTINGS: Settings = {
  delivery_fee: 250,
  free_delivery_threshold: 5000,
  announcement: "",
  whatsapp_number: "",
  contact_email: "",
  instagram_url: "",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizeProduct(row: any): Product {
  const category = Array.isArray(row.category) ? row.category[0] ?? null : row.category ?? null;
  const images: ProductImage[] = [...(row.images ?? [])]
    .map((img: any) => ({ id: img.id, path: img.path, alt: img.alt ?? "", position: img.position ?? 0 }))
    .sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    category_id: row.category_id ?? null,
    category: category as Category | null,
    price: row.price,
    sale_price: row.sale_price ?? null,
    tag: row.tag ?? null,
    is_active: row.is_active,
    is_featured: row.is_featured,
    in_stock: row.in_stock,
    sort_order: row.sort_order ?? 0,
    images,
  };
}

export function normalizeSettings(row: any): Settings {
  if (!row) return DEFAULT_SETTINGS;
  return {
    delivery_fee: row.delivery_fee ?? DEFAULT_SETTINGS.delivery_fee,
    free_delivery_threshold: row.free_delivery_threshold ?? null,
    announcement: row.announcement ?? "",
    whatsapp_number: row.whatsapp_number ?? "",
    contact_email: row.contact_email ?? "",
    instagram_url: row.instagram_url ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function imageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
}

export function coverImage(product: Product): string | null {
  return product.images[0] ? imageUrl(product.images[0].path) : null;
}

export function isOnSale(product: Pick<Product, "price" | "sale_price">): boolean {
  return product.sale_price !== null && product.sale_price < product.price;
}

export function effectivePrice(product: Pick<Product, "price" | "sale_price">): number {
  return isOnSale(product) ? (product.sale_price as number) : product.price;
}
