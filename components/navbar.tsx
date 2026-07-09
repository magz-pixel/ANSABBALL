"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { tryCreateClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnsaLogo } from "@/components/brand/ansa-logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/merchandise", label: "Store" },
];

export function Navbar() {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/dashboard") ?? false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();
  const supabase = tryCreateClient();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (isDashboardRoute) return null;

  return (
    <header className="sticky top-0 z-50 px-3 pt-2 sm:px-4 sm:pt-3">
      <nav className="mx-auto max-w-7xl rounded-2xl border border-gray-200/80 bg-white/95 shadow-lg shadow-black/5 backdrop-blur-md">
        <div className="flex h-[4.5rem] items-center justify-between gap-4 px-4 sm:px-6 md:h-20">
          <AnsaLogo href="/" priority className="shrink-0" />

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "text-ansa-primary"
                      : "text-gray-600 hover:text-ansa-primary"
                  )}
                >
                  {link.label}
                  {isActive ? (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-ansa-accent" />
                  ) : null}
                </Link>
              );
            })}
            {user ? (
              <Link
                href="/dashboard"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-ansa-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Dashboard
              </Link>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Login
              </Link>
            )}
            <Link
              href="/auth/register"
              className="rounded-xl bg-ansa-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-ansa-primary/90"
            >
              Join Now
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ansa-primary hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="min-h-[48px] rounded-xl px-3 py-3 text-base font-semibold text-ansa-primary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="min-h-[48px] rounded-xl px-3 py-3 text-base font-semibold text-ansa-primary hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="min-h-[48px] rounded-xl px-3 py-3 text-left text-base font-semibold text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="min-h-[48px] rounded-xl px-3 py-3 text-base font-semibold text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              <Link
                href="/auth/register"
                className="mt-2 flex min-h-[48px] items-center justify-center rounded-xl bg-ansa-primary text-base font-bold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Now
              </Link>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
