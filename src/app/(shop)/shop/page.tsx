import type { Metadata } from "next";
import { CategoryPills } from "@/components/shop/CategoryPills";
import { ProductGrid } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Shop bracelets" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ categorySlug: category }), getCategories()]);
  const current = categories.find((c) => c.slug === category);

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-24 pt-14">
      <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="eyebrow m-0">Shop</p>
          <h1 className="m-0 font-serif text-[clamp(44px,5vw,64px)] font-medium leading-none">
            {current ? current.name : "All bracelets"}
          </h1>
        </div>
        <CategoryPills categories={categories} active={current?.slug} />
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
