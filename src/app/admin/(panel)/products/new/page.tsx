import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";

export const metadata = { title: "Add bracelet" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("id, name, slug, sort_order").order("sort_order");
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-rose no-underline">
        ← All bracelets
      </Link>
      <h1 className="m-0 mb-6 font-serif text-[44px] font-medium leading-none">Add bracelet</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </>
  );
}
