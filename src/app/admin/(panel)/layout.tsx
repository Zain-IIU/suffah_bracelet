import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "../login/actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Suffah admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { supabase, user } = await requireAdmin();
  const { count: newOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="min-h-screen bg-[#FBF3F5]">
      <div className="mx-auto flex max-w-[1400px] flex-wrap gap-6 px-4 py-6 sm:px-6">
        <aside className="flex flex-[1_1_220px] flex-col gap-6 lg:sticky lg:top-6 lg:max-w-[240px] lg:self-start">
          <div>
            <Link href="/admin" className="font-serif text-[36px] font-semibold italic leading-none no-underline">
              Suffah
            </Link>
            <p className="eyebrow m-0 mt-1">Admin</p>
          </div>
          <AdminNav newOrders={newOrders ?? 0} />
          <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
            <span className="truncate text-mauve" title={user.email ?? ""}>
              {user.email}
            </span>
            <Link href="/" target="_blank" className="text-rose no-underline hover:underline">
              View shop ↗
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-medium text-plum underline underline-offset-[3px]"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <main className="min-w-0 flex-[999_1_640px]">{children}</main>
      </div>
    </div>
  );
}
