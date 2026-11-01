"use client";

import { useState } from "react";
import { useCart, useHydrated } from "@/lib/cart";

type Props = {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  inStock: boolean;
  qty?: number;
  className?: string;
};

export function AddToBagButton({ product, inStock, qty = 1, className = "" }: Props) {
  const add = useCart((s) => s.add);
  const inBag = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const hydrated = useHydrated();
  const [justAdded, setJustAdded] = useState(false);

  if (!inStock) {
    return (
      <button type="button" disabled className={`btn btn-outline w-full uppercase tracking-[0.08em] ${className}`}>
        Sold out
      </button>
    );
  }

  const count = hydrated ? inBag : 0;
  const label = justAdded ? "Added to bag" : count > 0 ? `Add another · ${count} in bag` : "Add to bag";

  return (
    <button
      type="button"
      aria-label={`Add ${product.name} to bag`}
      onClick={() => {
        add(product, qty);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1400);
      }}
      className={`btn w-full uppercase tracking-[0.08em] ${count > 0 || justAdded ? "btn-primary" : "btn-outline"} ${className}`}
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
