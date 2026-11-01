import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { Price } from "@/components/shop/Price";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { getProductBySlug, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { coverImage, effectivePrice, imageUrl, isOnSale } from "@/lib/products";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Bracelet not found" };
  const image = coverImage(product);
  return {
    title: product.name,
    description: product.description || `${product.name} — handmade by Suffah.`,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const images = product.images.map((img) => ({ url: imageUrl(img.path), alt: img.alt || product.name }));
  const saving = isOnSale(product) ? product.price - (product.sale_price as number) : 0;

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-24 pt-10">
      <Link
        href={product.category ? `/shop?category=${product.category.slug}` : "/shop"}
        className="mb-8 inline-flex h-11 items-center gap-2 text-[15px] font-medium text-rose no-underline"
      >
        <ArrowLeftIcon /> {product.category ? product.category.name : "All bracelets"}
      </Link>

      <div className="flex flex-wrap items-start gap-12">
        <div className="min-w-0 flex-[1_1_440px]">
          <ProductGallery images={images} name={product.name} />
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
          {product.tag ? <p className="eyebrow m-0">{product.tag}</p> : null}
          <h1 className="m-0 font-serif text-[clamp(44px,5vw,64px)] font-medium leading-[1.02]">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Price price={product.price} sale_price={product.sale_price} className="text-[22px] font-medium" />
            {saving > 0 ? (
              <span className="rounded-full bg-blush px-3 py-1 text-[13px] font-medium">Save {formatPrice(saving)}</span>
            ) : null}
          </div>
          {product.description ? (
            <p className="m-0 whitespace-pre-line text-[17px] leading-[1.7] text-mauve">{product.description}</p>
          ) : null}

          <ProductPurchase
            inStock={product.in_stock}
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: effectivePrice(product),
              image: images[0]?.url ?? null,
            }}
          />

          <ul className="m-0 flex list-none flex-col gap-2 border-t border-line p-0 pt-5 text-[15px] text-mauve">
            <li>Cash on delivery — we&apos;ll call or WhatsApp you to confirm your order.</li>
            {settings.free_delivery_threshold !== null ? (
              <li>Free delivery on orders over {formatPrice(settings.free_delivery_threshold)}.</li>
            ) : null}
            <li>Gift-ready packaging, with an optional note.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
