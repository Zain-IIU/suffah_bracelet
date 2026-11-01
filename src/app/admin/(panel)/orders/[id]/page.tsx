import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice, toWhatsAppNumber } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS, type Order, type OrderItem } from "@/lib/types";
import { updateOrder } from "../../actions";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: orderRow }, { data: itemRows }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);
  if (!orderRow) notFound();
  const order = orderRow as Order;
  const items = (itemRows ?? []) as OrderItem[];

  const itemsText = items.map((i) => `• ${i.product_name} × ${i.quantity} — ${formatPrice(i.line_total)}`).join("\n");
  const waMessage = `Hi ${order.customer_name}, thank you for your order from Suffah!

Order ${order.order_number}:
${itemsText}
Delivery: ${order.delivery_fee === 0 ? "Free" : formatPrice(order.delivery_fee)}
Total (cash on delivery): ${formatPrice(order.total)}

Delivering to: ${order.address}, ${order.city}

Could you please confirm your order and address?`;
  const waLink = `https://wa.me/${toWhatsAppNumber(order.phone)}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-rose no-underline">
        ← All orders
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-serif text-[44px] font-medium leading-none">{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-mauve">Placed {formatDateTime(order.created_at)}</span>
      </div>

      {sp.saved ? <Notice>Order updated.</Notice> : null}
      {sp.error ? <Notice tone="error">Couldn&apos;t save the change. Please try again.</Notice> : null}

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-6">
          <section className="admin-card p-6">
            <h2 className="m-0 mb-4 font-serif text-[26px] font-semibold">Customer</h2>
            <dl className="m-0 grid grid-cols-[minmax(110px,auto)_1fr] gap-x-6 gap-y-3 text-[15px]">
              <dt className="text-mauve">Name</dt>
              <dd className="m-0 font-medium">{order.customer_name}</dd>
              <dt className="text-mauve">Phone</dt>
              <dd className="m-0">{order.phone}</dd>
              {order.email ? (
                <>
                  <dt className="text-mauve">Email</dt>
                  <dd className="m-0 break-all">{order.email}</dd>
                </>
              ) : null}
              <dt className="text-mauve">Address</dt>
              <dd className="m-0 whitespace-pre-line">
                {order.address}
                <br />
                {order.city}
                {order.postal_code ? ` ${order.postal_code}` : ""}
              </dd>
              {order.gift_note ? (
                <>
                  <dt className="text-mauve">Gift note</dt>
                  <dd className="m-0 whitespace-pre-line rounded-xl bg-blush-soft px-3 py-2 italic">{order.gift_note}</dd>
                </>
              ) : null}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm min-h-11">
                Confirm on WhatsApp
              </a>
              <a href={`tel:${order.phone}`} className="btn btn-outline btn-sm min-h-11">
                Call {order.phone}
              </a>
              {order.email ? (
                <a
                  href={`mailto:${order.email}?subject=${encodeURIComponent(`Your Suffah order ${order.order_number}`)}`}
                  className="btn btn-outline btn-sm min-h-11"
                >
                  Email
                </a>
              ) : null}
            </div>
          </section>

          <section className="admin-card overflow-hidden">
            <h2 className="m-0 border-b border-line px-6 py-4 font-serif text-[26px] font-semibold">Items</h2>
            <ul className="m-0 list-none p-0">
              {items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-4 border-b border-line px-6 py-3.5 last:border-b-0">
                  <span className="min-w-0 flex-1 font-medium">
                    {i.product_id ? (
                      <Link href={`/admin/products/${i.product_id}`} className="no-underline hover:text-rose">
                        {i.product_name}
                      </Link>
                    ) : (
                      i.product_name
                    )}
                  </span>
                  <span className="text-mauve">
                    {formatPrice(i.unit_price)} × {i.quantity}
                  </span>
                  <span className="w-[100px] text-right font-medium">{formatPrice(i.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-line bg-cream px-6 py-4 text-[15px]">
              <div className="flex justify-between">
                <span className="text-mauve">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mauve">Delivery</span>
                <span>{order.delivery_fee === 0 ? "Free" : formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-medium">Total (cash on delivery)</span>
                <span className="font-serif text-[28px] font-semibold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        <section className="admin-card flex-[1_1_300px] p-6">
          <h2 className="m-0 mb-4 font-serif text-[26px] font-semibold">Update</h2>
          <form action={updateOrder} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={order.id} />
            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" defaultValue={order.status} className="field">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin_notes" className="field-label">
                Private notes
              </label>
              <textarea
                id="admin_notes"
                name="admin_notes"
                rows={5}
                defaultValue={order.admin_notes ?? ""}
                placeholder="e.g. Confirmed on call, deliver after 5pm"
                className="field text-[15px]"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <p className="m-0 text-[13px] leading-normal text-mauve">
              New → call or WhatsApp to confirm → Confirmed → Shipped → Delivered.
            </p>
          </form>
        </section>
      </div>
    </>
  );
}
