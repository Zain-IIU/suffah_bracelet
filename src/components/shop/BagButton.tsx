"use client";

import Link from "next/link";
import { BagIcon } from "@/components/icons";
import { cartCount, useCart, useHydrated } from "@/lib/cart";

export function BagButton() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  return (
    <Link
      href="/bag"
      aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
      className="btn btn-primary btn-sm min-h-[44px] px-[18px]"
    >
      <BagIcon />
      <span>Bag ({count})</span>
    </Link>
  );
}
