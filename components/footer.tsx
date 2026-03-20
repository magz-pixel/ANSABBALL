import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#001F3F] py-8 text-white supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="text-balance font-medium">© 2026 ANSA Basketball Academy | Nairobi, Kenya</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/90 sm:gap-x-6">
          <Link
            href="/merchandise"
            className="inline-flex min-h-[44px] items-center rounded-md px-1 py-2 hover:text-white hover:underline touch-manipulation"
          >
            Merchandise
          </Link>
          <span className="text-white/50" aria-hidden>
            •
          </span>
          <span className="select-all">0718082452 / 0740406721</span>
          <span className="text-white/50" aria-hidden>
            •
          </span>
          <Link
            href="https://instagram.com/AnsaBasketball"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-md px-1 py-2 hover:text-white hover:underline touch-manipulation"
          >
            IG: @AnsaBasketball
          </Link>
          <span className="text-white/50" aria-hidden>
            •
          </span>
          <Link
            href="https://facebook.com/AnsaBasketball"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-md px-1 py-2 hover:text-white hover:underline touch-manipulation"
          >
            FB: @AnsaBasketball
          </Link>
        </div>
      </div>
    </footer>
  );
}
