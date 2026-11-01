import Link from "next/link";
import { toWhatsAppNumber } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-blush text-plum">
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-10 px-6 pb-10 pt-16">
        <div className="flex flex-[1_1_240px] flex-col gap-3">
          <span className="font-serif text-[46px] font-semibold italic leading-none">Suffah</span>
          <p className="m-0 max-w-[280px] text-[15px] leading-relaxed text-[#5A3542]">
            Handmade bracelets for every mood and every day.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-[1_1_180px] flex-col gap-3 text-[15px]">
          <span className="eyebrow">Shop</span>
          <Link href="/shop" className="no-underline hover:text-rose">
            All bracelets
          </Link>
          <Link href="/shop?category=gift-sets" className="no-underline hover:text-rose">
            Gift sets
          </Link>
          <Link href="/bag" className="no-underline hover:text-rose">
            Your bag
          </Link>
        </nav>
        <div className="flex flex-[1_1_240px] flex-col gap-3 text-[15px]">
          <span className="eyebrow">Get in touch</span>
          {settings.whatsapp_number ? (
            <a
              href={`https://wa.me/${toWhatsAppNumber(settings.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:text-rose"
            >
              WhatsApp: {settings.whatsapp_number}
            </a>
          ) : null}
          {settings.contact_email ? (
            <a href={`mailto:${settings.contact_email}`} className="no-underline hover:text-rose">
              {settings.contact_email}
            </a>
          ) : null}
          {settings.instagram_url ? (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="no-underline hover:text-rose">
              Instagram
            </a>
          ) : null}
          <p className="m-0 text-[#5A3542]">Cash on delivery · Easy exchanges</p>
        </div>
      </div>
      <div className="mx-auto max-w-[1240px] border-t border-plum/20 px-6 pb-8 pt-5 text-[13px] text-[#5A3542]">
        © {year} Suffah
      </div>
    </footer>
  );
}
