export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ProductImage = {
  id?: string;
  path: string;
  alt: string;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  category: Category | null;
  price: number;
  sale_price: number | null;
  tag: string | null;
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  sort_order: number;
  images: ProductImage[];
};

export type Settings = {
  delivery_fee: number;
  free_delivery_threshold: number | null;
  announcement: string;
  whatsapp_number: string;
  contact_email: string;
  instagram_url: string;
};

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  gift_note: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  admin_notes: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};
