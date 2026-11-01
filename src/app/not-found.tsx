import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="font-serif text-[44px] font-semibold italic">Suffah</span>
      <h1 className="m-0 font-serif text-[48px] font-medium leading-tight">We couldn&apos;t find that page.</h1>
      <p className="m-0 text-mauve">It may have moved, or the bracelet is no longer available.</p>
      <Link href="/shop" className="btn btn-primary min-h-[52px]">
        Browse bracelets
      </Link>
    </main>
  );
}
