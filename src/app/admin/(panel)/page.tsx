import Link from "next/link";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export const metadata = { title: "Dashboard" };

/** Midnight today in Pakistan (UTC+5, no daylight saving). */
function startOfTodayKarachi(): string {
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }); // YYYY-MM-DD
  return new Date(`${date}T00:00:00+05:00`).toISOString();
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const today = startOfTodayKarachi();

  const [newRes, todayRes, activeRes, recentRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("total, status").gte("created_at", today),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase
      .from("orders")
      .select("id, order_number, status, customer_name, city, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const todayOrders = (todayRes.data ?? []) as { total: number; status: string }[];
  const todayValue = todayOrders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);
  const recent = (recentRes.data ?? []) as Pick<
    Order,
    "id" | "order_number" | "status" | "customer_name" | "city" | "total" | "created_at"
  >[];

  const stats = [
    { label: "New orders to confirm", value: String(newRes.count ?? 0), href: "/admin/orders?status=new" },
    { label: "Orders today", value: String(todayOrders.length), href: "/admin/orders" },
    { label: "Value today", value: formatPrice(todayValue), href: "/admin/orders" },
    { label: "Bracelets in the shop", value: String(activeRes.count ?? 0), href: "/admin/products" },
  ];

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Dashboard">
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          Add bracelet
        </Link>
      </PageHeader>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-card flex flex-col gap-2 p-5 no-underline hover:border-rose">
            <span className="text-sm text-mauve">{s.label}</span>
            <span className="font-serif text-[40px] font-semibold leading-none">{s.value}</span>
          </Link>
        ))}
      </div>

      <section className="admin-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-rose no-underline hover:underline">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="m-0 px-5 py-10 text-center text-mauve">No orders yet. They&apos;ll appear here as soon as someone checks out.</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {recent.map((o) => (
              <li key={o.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3.5 no-underline hover:bg-cream"
                >
                  <span className="w-[90px] font-medium">{o.order_number}</span>
                  <span className="min-w-[140px] flex-1">
                    {o.customer_name} <span className="text-mauve">· {o.city}</span>
                  </span>
                  <span className="text-sm text-mauve">{formatDateTime(o.created_at)}</span>
                  <span className="w-[100px] text-right font-medium">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
