import Link from "next/link";
import { BagButton } from "./BagButton";

const navLink =
  "inline-flex h-11 items-center px-3.5 text-[13px] font-medium uppercase tracking-[0.14em] no-underline hover:text-rose";

export function Header({ announcement }: { announcement: string }) {
  return (
    <>
      {announcement ? (
        <div className="bg-plum px-4 py-2.5 text-center text-[13px] tracking-[0.08em] text-blush">{announcement}</div>
      ) : null}
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-6 py-3.5">
          <nav aria-label="Main" className="order-2 flex flex-1 basis-full flex-wrap justify-center gap-1 sm:order-1 sm:basis-[260px] sm:justify-start">
            <Link href="/shop" className={navLink}>
              Shop
            </Link>
            <Link href="/shop?category=gift-sets" className={navLink}>
              Gift sets
            </Link>
            <Link href="/#story" className={navLink}>
              Our story
            </Link>
          </nav>
          <Link
            href="/"
            aria-label="Suffah, home"
            className="order-1 font-serif text-[40px] font-semibold italic leading-none no-underline sm:order-2 sm:text-[44px]"
          >
            Suffah
          </Link>
          <div className="order-1 flex justify-end sm:order-3 sm:flex-1 sm:basis-[260px]">
            <BagButton />
          </div>
        </div>
      </header>
    </>
  );
}
