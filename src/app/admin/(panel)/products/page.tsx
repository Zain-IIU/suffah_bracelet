import Link from "next/link";
import { BraceletPlaceholder } from "@/components/icons";
import { Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SELECT, coverImage, isOnSale, normalizeProduct } from "@/lib/products";
import { toggleProductVisibility } from "../actions";

export const metadata = { title: "Bracelets" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const products = ((data ?? []) as unknown[]).map(normalizeProduct);

  return (
    <>
      <PageHeader title="Bracelets">
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          Add bracelet
        </Link>
      </PageHeader>
      {sp.deleted ? <Notice>Bracelet deleted.</Notice> : null}
      {error ? <Notice tone="error">Couldn&apos;t load bracelets: {error.message}</Notice> : null}

      {products.length === 0 ? (
        <div className="admin-card flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="m-0 font-serif text-[30px] italic">No bracelets yet.</p>
          <Link href="/admin/products/new" className="btn btn-primary">
            Add your first bracelet
          </Link>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-mauve">
                <th className="px-4 py-3 font-medium">Bracelet</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">In shop</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = coverImage(p);
                return (
                  <tr key={p.id} className="border-b border-line last:border-b-0 hover:bg-cream">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 no-underline">
                        <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-blush">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <BraceletPlaceholder className="h-[80%] w-[80%]" />
                          )}
                        </span>
                        <span className="flex flex-col">
                          <span className="font-medium hover:text-rose">{p.name}</span>
                          <span className="text-xs text-mauve">
                            {p.images.length} photo{p.images.length === 1 ? "" : "s"}
                            {p.tag ? ` · ${p.tag}` : ""}
                            {p.is_featured ? " · Featured" : ""}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mauve">{p.category?.name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {isOnSale(p) ? (
                        <span className="flex flex-col items-end">
                          <span className="font-medium text-rose">{formatPrice(p.sale_price as number)}</span>
                          <s className="text-xs text-mauve">{formatPrice(p.price)}</s>
                        </span>
                      ) : (
                        <span className="font-medium">{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.in_stock ? (
                        <span className="text-success">In stock</span>
                      ) : (
                        <span className="font-medium text-danger">Sold out</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form action={toggleProductVisibility}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="next" value={String(!p.is_active)} />
                        <button
                          type="submit"
                          className={`min-h-9 cursor-pointer rounded-full border px-3 text-xs font-semibold ${
                            p.is_active ? "border-success bg-[#E7F3EA] text-success" : "border-line bg-white text-mauve"
                          }`}
                          aria-label={`${p.is_active ? "Hide" : "Show"} ${p.name} ${p.is_active ? "from" : "in"} the shop`}
                        >
                          {p.is_active ? "Visible" : "Hidden"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
