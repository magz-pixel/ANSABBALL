import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#001F3F] py-8 text-white">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-medium">© 2026 ANSA Basketball Academy | Nairobi, Kenya</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-white/90">
          <Link href="/merchandise" className="hover:text-white hover:underline">
            Merchandise
          </Link>
          <span>•</span>
          <span>Tel: 0718082452 / 0740406721</span>
          <span>•</span>
          <Link
            href="https://instagram.com/AnsaBasketball"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:underline"
          >
            IG: @AnsaBasketball
          </Link>
          <span>•</span>
          <Link
            href="https://facebook.com/AnsaBasketball"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:underline"
          >
            FB: @AnsaBasketball
          </Link>
        </div>
      </div>
    </footer>
  );
}
