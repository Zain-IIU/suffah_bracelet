import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { PRODUCT_SELECT, normalizeProduct } from "@/lib/products";
import type { Category } from "@/lib/types";
import { deleteProduct } from "../../actions";

export const metadata = { title: "Edit bracelet" };

export default async function EditProductPage({
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

  const [{ data: row }, { data: cats }] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
  ]);
  if (!row) notFound();
  const product = normalizeProduct(row);

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-rose no-underline">
        ← All bracelets
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="m-0 font-serif text-[44px] font-medium leading-none">{product.name}</h1>
        {product.is_active ? (
          <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-outline btn-sm">
            View in shop ↗
          </Link>
        ) : null}
      </div>
      {sp.saved ? <Notice>Saved. Changes are live in the shop.</Notice> : null}
      {sp.error ? <Notice tone="error">Couldn&apos;t delete this bracelet. Please try again.</Notice> : null}

      <ProductForm key={`${product.id}-${sp.saved ?? ""}`} product={product} categories={(cats ?? []) as Category[]} />

      <section className="admin-card mt-8 flex flex-wrap items-center justify-between gap-4 border-danger/30 p-6">
        <div>
          <h2 className="m-0 font-serif text-[24px] font-semibold">Delete bracelet</h2>
          <p className="m-0 mt-1 text-sm text-mauve">
            Removes it and its photos. Past orders keep their details. To keep it but stop selling it, untick
            &ldquo;Show in shop&rdquo; instead.
          </p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmit
            className="btn btn-danger btn-sm"
            message={`Delete "${product.name}" and its photos? This can't be undone.`}
          >
            Delete permanently
          </ConfirmSubmit>
        </form>
      </section>
    </>
  );
}
