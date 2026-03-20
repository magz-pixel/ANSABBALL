"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMerchCart } from "./cart-context";

const links = [
  { href: "/merchandise", label: "Shop" },
  { href: "/merchandise/cart", label: "Cart" },
];

export function MerchNavBar() {
  const pathname = usePathname();
  const { itemCount } = useMerchCart();

  return (
    <div className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/merchandise"
                ? pathname === "/merchandise"
                : pathname.startsWith(l.href) ||
                  pathname.startsWith("/merchandise/checkout");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation sm:min-h-0",
                  active
                    ? "bg-[#001F3F] text-white"
                    : "text-[#001F3F] hover:bg-white"
                )}
              >
                {l.label}
                {l.href === "/merchandise/cart" && itemCount > 0 ? (
                  <span className="ml-1.5 rounded-full bg-[#0066CC] px-2 py-0.5 text-xs text-white">
                    {itemCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
        <p className="hidden text-xs text-gray-600 sm:block">
          Prices in KES · M-Pesa at checkout
        </p>
      </div>
    </div>
  );
}
