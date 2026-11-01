"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QTY } from "@/lib/cart";
import { AddToBagButton } from "./AddToBagButton";
import { QtyStepper } from "./QtyStepper";

type Props = {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  inStock: boolean;
};

export function ProductPurchase({ product, inStock }: Props) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-3 pt-2">
      {inStock ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Quantity</span>
          <QtyStepper
            value={qty}
            onChange={(n) => setQty(Math.min(MAX_QTY, Math.max(1, n)))}
            label={product.name}
          />
        </div>
      ) : null}
      <AddToBagButton product={product} inStock={inStock} qty={qty} className="min-h-[56px]" />
      {inStock ? (
        <Link href="/bag" className="btn btn-outline min-h-[52px]">
          View bag &amp; checkout
        </Link>
      ) : null}
    </div>
  );
}
