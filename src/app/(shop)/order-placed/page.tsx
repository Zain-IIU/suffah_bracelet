import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "@/components/icons";
import { getSettings } from "@/lib/data";
import { formatPrice, toWhatsAppNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default async function OrderPlacedPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; total?: string }>;
}) {
  const { no, total } = await searchParams;
  const settings = await getSettings();
  const orderNo = (no ?? "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 20);
  const amount = Number(total);

  return (
    <section className="mx-auto flex max-w-[720px] flex-col items-center gap-5 px-6 pb-[120px] pt-24 text-center">
      <span className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full bg-blush">
        <CheckIcon />
      </span>
      {orderNo ? <p className="eyebrow m-0">Order {orderNo}</p> : null}
      <h1 className="m-0 font-serif text-[clamp(44px,5vw,60px)] font-medium leading-[1.05]">
        Thank you — your order is placed.
      </h1>
      <p className="m-0 max-w-[520px] text-[17px] leading-relaxed text-mauve">
        We&apos;ll call or WhatsApp you shortly to confirm your order and delivery details.
        {Number.isFinite(amount) && amount > 0
          ? ` Please keep ${formatPrice(amount)} ready in cash for when it arrives.`
          : ""}
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/shop" className="btn btn-primary min-h-[52px]">
          Continue shopping
        </Link>
        {settings.whatsapp_number ? (
          <a
            href={`https://wa.me/${toWhatsAppNumber(settings.whatsapp_number)}?text=${encodeURIComponent(
              `Hi Suffah! I just placed order ${orderNo}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline min-h-[52px]"
          >
            Message us on WhatsApp
          </a>
        ) : null}
      </div>
    </section>
  );
}
