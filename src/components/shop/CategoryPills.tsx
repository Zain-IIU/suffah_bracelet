import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryPills({ categories, active }: { categories: Category[]; active?: string }) {
  const pill = (isActive: boolean) =>
    `inline-flex h-11 items-center rounded-full border border-plum px-5 text-sm font-medium tracking-[0.04em] no-underline ${
      isActive ? "bg-plum text-cream" : "hover:bg-blush-soft"
    }`;
  return (
    <nav aria-label="Categories" className="flex flex-wrap gap-2">
      <Link href="/shop" className={pill(!active)} aria-current={!active ? "page" : undefined}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/shop?category=${c.slug}`}
          className={pill(active === c.slug)}
          aria-current={active === c.slug ? "page" : undefined}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
