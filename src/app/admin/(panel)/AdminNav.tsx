"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Bracelets" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1 lg:flex-col">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3.5 text-[15px] font-medium no-underline ${
              active ? "bg-plum text-cream" : "hover:bg-blush-soft"
            }`}
          >
            {l.label}
            {l.href === "/admin/orders" && newOrders > 0 ? (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-cream text-plum" : "bg-rose text-white"}`}
              >
                {newOrders} new
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
