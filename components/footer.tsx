import Link from "next/link";
import { AnsaLogo } from "@/components/brand/ansa-logo";

export function Footer() {
  return (
    <footer className="bg-ansa-primary text-white supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <AnsaLogo href="/" variant="light" className="justify-center md:justify-start" />
            <p className="mt-4 max-w-sm text-sm text-white/75">
              Developing athletes and building leaders on and off the court in Nairobi, Kenya.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-bold uppercase tracking-wider text-ansa-accent">Explore</p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/programs" className="hover:text-white">Programs</Link></li>
                <li><Link href="/scholarships" className="hover:text-white">Scholarships</Link></li>
                <li><Link href="/merchandise" className="hover:text-white">Store</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider text-ansa-accent">Join</p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li><Link href="/auth/register" className="hover:text-white">Register</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign in</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-bold uppercase tracking-wider text-ansa-accent">Contact</p>
              <ul className="mt-3 space-y-2 text-white/80">
                <li className="select-all">0718082452</li>
                <li className="select-all">0740406721</li>
                <li>
                  <Link href="https://instagram.com/AnsaBasketball" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    @AnsaBasketball
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/60">
          © 2026 ANSA Basketball Academy · Nairobi, Kenya
        </div>
      </div>
    </footer>
  );
}
