import Link from "next/link";
import { BraceletPlaceholder } from "@/components/icons";
import { coverImage, effectivePrice } from "@/lib/products";
import type { Product } from "@/lib/types";
import { AddToBagButton } from "./AddToBagButton";
import { Price } from "./Price";

export function ProductCard({ product }: { product: Product }) {
  const image = coverImage(product);
  return (
    <article className="flex flex-col gap-3.5">
      <Link
        href={`/product/${product.slug}`}
        className="arch relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-blush"
        aria-label={product.name}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.images[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : (
          <BraceletPlaceholder className="h-[70%] w-[70%]" />
        )}
        {product.tag || !product.in_stock ? (
          <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream px-3.5 py-[7px] text-xs font-medium uppercase tracking-[0.14em]">
            {product.in_stock ? product.tag : "Sold out"}
          </span>
        ) : null}
      </Link>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 font-serif text-[28px] font-semibold leading-tight">
          <Link href={`/product/${product.slug}`} className="no-underline hover:text-rose">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} sale_price={product.sale_price} className="flex-none text-base font-medium" />
      </div>
      {product.description ? (
        <p className="m-0 line-clamp-2 text-[15px] leading-relaxed text-mauve">{product.description}</p>
      ) : null}
      <AddToBagButton
        inStock={product.in_stock}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: effectivePrice(product),
          image,
        }}
      />
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl bg-blush px-6 py-16 text-center">
        <p className="m-0 font-serif text-[30px] italic">New bracelets are on their way — check back soon.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-7 gap-y-12">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
