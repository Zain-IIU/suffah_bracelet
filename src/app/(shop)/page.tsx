import Link from "next/link";
import { BraceletPlaceholder, CashIcon, GiftIcon, HeartIcon, SwapIcon } from "@/components/icons";
import { CategoryPills } from "@/components/shop/CategoryPills";
import { Price } from "@/components/shop/Price";
import { ProductGrid } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/lib/data";
import { coverImage } from "@/lib/products";

export const revalidate = 60;

const perks = [
  { icon: HeartIcon, label: "Handmade in small batches" },
  { icon: GiftIcon, label: "Gift-ready packaging" },
  { icon: CashIcon, label: "Cash on delivery" },
  { icon: SwapIcon, label: "Easy exchanges" },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts({ limit: 9 }), getCategories()]);
  const hero = products.find((p) => p.is_featured) ?? products[0];
  const heroImage = hero ? coverImage(hero) : null;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 px-6 pb-[72px] pt-14">
        <div className="flex flex-[1_1_420px] flex-col items-start gap-6">
          <p className="eyebrow m-0">New in · The Blush Edit</p>
          <h1 className="m-0 font-serif text-[clamp(48px,6vw,84px)] font-medium leading-[1.02] tracking-[-0.01em]">
            Little circles of <em className="italic text-rose">joy</em>, strung by hand.
          </h1>
          <p className="m-0 max-w-[460px] text-lg leading-relaxed text-mauve">
            Delicate bracelets in soft pinks, pearls and gold — made to be stacked, gifted and worn every day.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/shop" className="btn btn-primary min-h-[52px]">
              Shop the collection
            </Link>
            <Link href="/shop?category=gift-sets" className="btn btn-outline min-h-[52px]">
              Gift sets
            </Link>
          </div>
        </div>
        <div className="flex flex-[1_1_420px] justify-center">
          <div className="relative flex aspect-square w-full max-w-[540px] items-center justify-center overflow-hidden rounded-[999px_999px_28px_28px] bg-blush">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt={hero?.images[0]?.alt || hero?.name || ""} className="h-full w-full object-cover" />
            ) : (
              <BraceletPlaceholder className="h-[74%] w-[74%]" />
            )}
            {hero ? (
              <Link
                href={`/product/${hero.slug}`}
                className="absolute bottom-6 left-6 flex items-center gap-2.5 rounded-full bg-cream px-5 py-3 text-sm no-underline"
              >
                <span className="font-medium">{hero.name}</span>
                <Price price={hero.price} sale_price={hero.sale_price} className="text-mauve" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-y border-line">
        <ul className="mx-auto my-0 grid max-w-[1240px] list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 px-6 py-7">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3.5">
              <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blush">
                <Icon />
              </span>
              <span className="text-[15px]">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Collection */}
      <section id="collection" className="mx-auto max-w-[1240px] px-6 py-[88px]">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="eyebrow m-0">Shop</p>
            <h2 className="m-0 font-serif text-[56px] font-medium leading-[1.05]">The collection</h2>
          </div>
          <CategoryPills categories={categories} />
        </div>
        <ProductGrid products={products} />
        {products.length >= 9 ? (
          <div className="mt-14 flex justify-center">
            <Link href="/shop" className="btn btn-outline">
              View all bracelets
            </Link>
          </div>
        ) : null}
      </section>

      {/* Gifting */}
      <section className="bg-plum text-cream">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-10 px-6 py-20">
          <div className="flex flex-[1_1_520px] flex-col gap-4">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.24em] text-blush">Gifting</p>
            <h2 className="m-0 font-serif text-[52px] font-medium leading-[1.05]">Wrapped, ribboned and ready to give.</h2>
            <p className="m-0 max-w-[560px] text-[17px] leading-relaxed text-[#EBCBD3]">
              Add a gift note at checkout and we&apos;ll tuck it in with her bracelet — no prices inside the box.
            </p>
          </div>
          <Link
            href="/shop?category=gift-sets"
            className="btn min-h-[52px] border-blush bg-blush text-plum hover:bg-blush-soft"
          >
            Shop gift sets
          </Link>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mx-auto flex max-w-[1240px] scroll-mt-6 flex-wrap items-center gap-12 px-6 py-24">
        <div className="flex flex-[1_1_380px] flex-col gap-3">
          <p className="eyebrow m-0">Our story</p>
          <h2 className="m-0 font-serif text-[52px] font-medium leading-[1.05]">
            Made slowly, <em className="italic">with love.</em>
          </h2>
        </div>
        <div className="flex flex-[1_1_440px] flex-col gap-4 text-[17px] leading-[1.7] text-mauve">
          {/* TODO: replace with your own story */}
          <p className="m-0">
            Every Suffah bracelet is strung by hand in small batches, so each one gets the care it deserves.
          </p>
          <p className="m-0">
            We choose soft colours, pearls and gold-tone details that layer beautifully — and we pack every order as if it
            were a gift.
          </p>
        </div>
      </section>
    </>
  );
}
