"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { placeOrder, type PlaceOrderState } from "@/app/actions/place-order";
import { ArrowLeftIcon, BraceletPlaceholder } from "@/components/icons";
import { cartSubtotal, useCart, useHydrated } from "@/lib/cart";
import { deliveryFor, formatPrice } from "@/lib/format";
import type { Settings } from "@/lib/types";

const initialState: PlaceOrderState = { ok: false };

function Field({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  useEffect(() => {
    if (state.ok && state.orderNumber) {
      clear();
      router.replace(`/order-placed?no=${encodeURIComponent(state.orderNumber)}&total=${state.total ?? 0}`);
    }
  }, [state, clear, router]);

  const subtotal = cartSubtotal(items);
  const delivery = deliveryFor(subtotal, settings);
  const total = subtotal + delivery;
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const payload = JSON.stringify(items.map((i) => ({ product_id: i.id, quantity: i.qty })));

  if (hydrated && items.length === 0 && !state.ok) {
    return (
      <section className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h1 className="m-0 font-serif text-[52px] font-medium">Your bag is empty</h1>
        <p className="text-mauve">Add a bracelet or two before checking out.</p>
        <Link href="/shop" className="btn btn-primary mt-4 min-h-[52px]">
          Browse bracelets
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1240px] px-6 pb-24 pt-12">
      <Link href="/bag" className="inline-flex h-11 items-center gap-2 text-[15px] font-medium text-rose no-underline">
        <ArrowLeftIcon /> Back to bag
      </Link>
      <h1 className="mb-9 mt-4 font-serif text-[64px] font-medium leading-none">Checkout</h1>

      <form action={formAction} className="flex flex-wrap items-start gap-12" noValidate>
        <input type="hidden" name="items" value={payload} />
        {/* Honeypot for bots — hidden from people and screen readers */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-11">
          <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
            <legend className="mb-5 p-0 font-serif text-[30px] font-semibold">1 · Your details</legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
              <Field id="name" label="Full name" error={fe.name}>
                <input
                  id="name"
                  name="name"
                  defaultValue={v.name}
                  type="text"
                  autoComplete="name"
                  required
                  className="field"
                  aria-invalid={!!fe.name}
                  aria-describedby={fe.name ? "name-error" : undefined}
                />
              </Field>
              <Field id="phone" label="Mobile number (for confirmation)" error={fe.phone}>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={v.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0300 1234567"
                  required
                  className="field"
                  aria-invalid={!!fe.phone}
                  aria-describedby={fe.phone ? "phone-error" : undefined}
                />
              </Field>
              <Field id="email" label="Email (optional)" error={fe.email} className="col-span-full">
                <input
                  id="email"
                  name="email"
                  defaultValue={v.email}
                  type="email"
                  autoComplete="email"
                  className="field"
                  aria-invalid={!!fe.email}
                  aria-describedby={fe.email ? "email-error" : undefined}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
            <legend className="mb-5 p-0 font-serif text-[30px] font-semibold">2 · Delivery address</legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
              <Field id="address" label="House / street address" error={fe.address} className="col-span-full">
                <input
                  id="address"
                  name="address"
                  defaultValue={v.address}
                  type="text"
                  autoComplete="street-address"
                  required
                  className="field"
                  aria-invalid={!!fe.address}
                  aria-describedby={fe.address ? "address-error" : undefined}
                />
              </Field>
              <Field id="city" label="City" error={fe.city}>
                <input
                  id="city"
                  name="city"
                  defaultValue={v.city}
                  type="text"
                  autoComplete="address-level2"
                  required
                  className="field"
                  aria-invalid={!!fe.city}
                  aria-describedby={fe.city ? "city-error" : undefined}
                />
              </Field>
              <Field id="postal_code" label="Postal code (optional)" error={fe.postal_code}>
                <input id="postal_code" name="postal_code" defaultValue={v.postal_code} type="text" autoComplete="postal-code" className="field" />
              </Field>
              <Field id="gift_note" label="Gift note (optional)" error={fe.gift_note} className="col-span-full">
                <textarea id="gift_note" name="gift_note" defaultValue={v.gift_note} rows={3} maxLength={300} className="field" />
              </Field>
            </div>
          </fieldset>

          <div className="rounded-2xl bg-blush px-5 py-4 text-[15px] leading-relaxed">
            <strong className="font-medium">Payment: cash on delivery.</strong> After you place your order we&apos;ll call or
            WhatsApp you to confirm the details before we send it out.
          </div>
        </div>

        <aside className="flex flex-[1_1_340px] flex-col gap-4 rounded-3xl border border-line bg-white p-8">
          <h2 className="m-0 font-serif text-[32px] font-semibold">Your order</h2>
          {!hydrated ? (
            <p className="m-0 text-mauve">Loading…</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3.5">
                  <span className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-blush">
                    {i.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <BraceletPlaceholder className="h-[84%] w-[84%]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px]">
                    {i.name} <span className="text-mauve">× {i.qty}</span>
                  </span>
                  <span className="flex-none text-[15px] font-medium">{formatPrice(i.qty * i.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-2.5 border-t border-line pt-4">
            <div className="flex justify-between">
              <span className="text-mauve">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mauve">Delivery</span>
              <span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="font-medium">Total</span>
            <span className="font-serif text-[34px] font-semibold">{formatPrice(total)}</span>
          </div>

          {state.message && !state.ok ? (
            <p role="alert" className="m-0 rounded-xl border border-danger/30 bg-[#FCEDEF] px-3.5 py-3 text-sm text-danger">
              {state.message}
            </p>
          ) : null}

          <button type="submit" disabled={pending || !hydrated || items.length === 0} className="btn btn-primary min-h-14">
            {pending ? "Placing your order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="m-0 text-center text-[13px] leading-normal text-mauve">
            No payment now — you pay cash when your bracelets arrive.
          </p>
        </aside>
      </form>
    </section>
  );
}
