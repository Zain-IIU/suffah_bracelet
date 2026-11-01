import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 60);

  let query = supabase
    .from("orders")
    .select("id, order_number, status, customer_name, phone, city, total, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  if (q) {
    const safe = q.replace(/[,()%*]/g, " ");
    query = query.or(`order_number.ilike.%${safe}%,customer_name.ilike.%${safe}%,phone.ilike.%${safe}%`);
  }

  const { data, count, error } = await query;
  const orders = (data ?? []) as Pick<
    Order,
    "id" | "order_number" | "status" | "customer_name" | "phone" | "city" | "total" | "created_at"
  >[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const href = (params: { status?: string; page?: number }) => {
    const u = new URLSearchParams();
    if (params.status) u.set("status", params.status);
    if (q) u.set("q", q);
    if (params.page && params.page > 1) u.set("page", String(params.page));
    const s = u.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  const tab = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium no-underline ${
      active ? "border-plum bg-plum text-cream" : "border-line bg-white hover:border-rose"
    }`;

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Orders" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
          <Link href={href({})} className={tab(!status)}>
            All
          </Link>
          {ORDER_STATUSES.map((s) => (
            <Link key={s} href={href({ status: s })} className={tab(status === s)}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </nav>
        <form action="/admin/orders" className="flex gap-2" role="search">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="q" className="sr-only">
            Search orders
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Order no., name or phone"
            className="field min-h-10 w-[240px] text-sm"
          />
          <button type="submit" className="btn btn-outline btn-sm">
            Search
          </button>
        </form>
      </div>

      {error ? <p className="text-danger">Couldn&apos;t load orders: {error.message}</p> : null}

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-mauve">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-mauve">
                  No orders here yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-b-0 hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-rose no-underline hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-mauve">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{o.phone}</td>
                  <td className="px-4 py-3">{o.city}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Pages" className="mt-5 flex items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link href={href({ status, page: page - 1 })} className="btn btn-outline btn-sm">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-mauve">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={href({ status, page: page + 1 })} className="btn btn-outline btn-sm">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
