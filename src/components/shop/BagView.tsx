"use client";

import Link from "next/link";
import { ArrowLeftIcon, BraceletPlaceholder } from "@/components/icons";
import { cartSubtotal, useCart, useHydrated } from "@/lib/cart";
import { deliveryFor, formatPrice } from "@/lib/format";
import type { Settings } from "@/lib/types";
import { QtyStepper } from "./QtyStepper";

export function BagView({ settings }: { settings: Settings }) {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const subtotal = cartSubtotal(items);
  const delivery = deliveryFor(subtotal, settings);
  const total = subtotal + delivery;
  const threshold = settings.free_delivery_threshold;

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-24 pt-12">
      <Link href="/shop" className="inline-flex h-11 items-center gap-2 text-[15px] font-medium text-rose no-underline">
        <ArrowLeftIcon /> Continue shopping
      </Link>
      <h1 className="mb-8 mt-4 font-serif text-[64px] font-medium leading-none">Your bag</h1>

      {!hydrated ? (
        <p className="text-mauve">Loading your bag…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-blush px-6 py-16 text-center">
          <p className="m-0 font-serif text-[34px] italic">Your bag is empty — for now.</p>
          <Link href="/shop" className="btn btn-primary min-h-[52px]">
            Browse bracelets
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-12">
          <ul className="m-0 min-w-0 flex-[999_1_560px] list-none border-t border-line p-0">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-5 border-b border-line py-6">
                <Link
                  href={`/product/${item.slug}`}
                  className="flex h-28 w-28 flex-none items-center justify-center overflow-hidden rounded-[18px] bg-blush"
                  aria-label={item.name}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <BraceletPlaceholder className="h-[84%] w-[84%]" />
                  )}
                </Link>
                <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
                  <Link href={`/product/${item.slug}`} className="font-serif text-[28px] font-semibold leading-tight no-underline">
                    {item.name}
                  </Link>
                  <span className="text-sm text-mauve">{formatPrice(item.price)} each</span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="min-h-11 cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-medium text-rose underline underline-offset-[3px]"
                  >
                    Remove
                  </button>
                </div>
                <QtyStepper value={item.qty} onChange={(n) => setQty(item.id, n)} label={item.name} />
                <span className="flex-[0_0_110px] text-right text-[17px] font-medium">{formatPrice(item.qty * item.price)}</span>
              </li>
            ))}
          </ul>

          <aside className="flex flex-[1_1_340px] flex-col gap-4 rounded-3xl border border-line bg-white p-8">
            <h2 className="m-0 font-serif text-[32px] font-semibold">Order summary</h2>
            <div className="flex justify-between">
              <span className="text-mauve">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mauve">Delivery</span>
              <span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
            </div>
            {threshold !== null ? (
              <p className="m-0 rounded-xl bg-blush px-3.5 py-3 text-sm leading-normal">
                {subtotal >= threshold
                  ? "You have unlocked free delivery."
                  : `Add ${formatPrice(threshold - subtotal)} more for free delivery.`}
              </p>
            ) : null}
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-medium">Total</span>
              <span className="font-serif text-[34px] font-semibold">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary min-h-14 uppercase tracking-[0.1em]">
              Checkout
            </Link>
            <p className="m-0 text-center text-[13px] text-mauve">Pay cash on delivery. No card needed.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
