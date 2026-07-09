import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { AnimatedCounter } from "@/components/animated-counter";
import { defaultDescription, siteUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Youth Basketball Training Nairobi & Kenya",
  description: defaultDescription,
  alternates: { canonical: "/" },
  openGraph: {
    url: siteUrl,
    title: "ANSA Basketball Academy — Kids & Youth Basketball in Nairobi",
    description: defaultDescription,
  },
};

const FEATURES = [
  {
    title: "Elite Training",
    desc: "High-level coaching to help you reach your full potential.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Academic Support",
    desc: "We support your education as much as your game.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
  {
    title: "Character Development",
    desc: "Building leaders, champions, and positive role models.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Compete & Succeed",
    desc: "Opportunities to compete and be seen.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: 50, suffix: "+", label: "Players" },
  { value: 15, suffix: "+", label: "Scholarships" },
  { value: 12, suffix: "", label: "Weekly Sessions" },
  { value: 0, suffix: "", label: "Nairobi, Kenya", isLocation: true },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Mobile hero (mock: full-bleed portrait image, centered copy, bottom feature card) ── */}
      <section className="relative flex min-h-svh flex-col bg-ansa-primary md:hidden">
        <div className="relative min-h-0 flex-1">
          <Image
            src="/hero-mobile-ansa.png"
            alt="ANSA Basketball Academy — athletes training in Nairobi"
            fill
            className="object-cover object-[center_36%]"
            priority
            quality={92}
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-ansa-primary from-0% via-ansa-primary/75 via-[32%] to-transparent to-[58%]"
            aria-hidden
          />

          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-20 text-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-ansa-accent sm:text-xs">
              Developing athletes. Building leaders.
            </p>
            <h1 className="font-display mt-3 text-[1.65rem] font-extrabold leading-[1.08] tracking-tight sm:text-3xl">
              <span className="block italic text-white">ELEVATE YOUR GAME.</span>
              <span className="mt-0.5 block italic text-ansa-accent">CHANGE YOUR LIFE.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/90 sm:mt-4 sm:max-w-sm sm:text-base">
              At ANSA Basketball Academy, we train the next generation of athletes on and off the
              court.
            </p>
            <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-2.5 sm:mt-6">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-ansa-accent font-bold text-white shadow-lg hover:bg-orange-600"
                )}
              >
                Join Now →
              </Link>
              <Link
                href="/programs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-2 border-white/90 bg-ansa-primary font-semibold text-white hover:bg-ansa-primary/90"
                )}
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-20 shrink-0 rounded-t-3xl bg-white px-3 py-5 shadow-[0_-12px_40px_-8px_rgba(0,31,63,0.2)] sm:px-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-ansa-accent sm:h-10 sm:w-10">
                  {feature.icon}
                </div>
                <h2 className="mt-2 text-[0.55rem] font-bold uppercase leading-tight tracking-wide text-ansa-primary sm:text-[0.65rem]">
                  {feature.title}
                </h2>
                <p className="mt-1 text-[0.5rem] leading-snug text-gray-600 line-clamp-3 sm:text-[0.6rem]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Desktop hero (unchanged) ── */}
      <section className="relative hidden w-full bg-ansa-primary md:block md:min-h-[min(75vh,820px)] md:overflow-visible md:pb-8">
        {/* Desktop: players right-aligned, contained */}
        <div className="absolute inset-y-0 right-0 hidden w-[70%] md:block lg:w-[62%]">
          <Image
            src="/hero-ansa.png"
            alt="ANSA Basketball Academy — athletes in navy and orange uniforms"
            fill
            className="object-contain object-right object-bottom"
            priority
            quality={92}
            sizes="62vw"
          />
        </div>

        {/* Desktop: navy fade */}
        <div
          className="absolute inset-0 hidden bg-gradient-to-r from-ansa-primary from-0% via-ansa-primary/92 via-[38%] to-transparent to-[72%] md:block"
          aria-hidden
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-t from-ansa-primary/25 via-transparent to-transparent md:block"
          aria-hidden
        />

        {/* Copy — desktop left column */}
        <div className="relative z-10 px-5 pt-5 pb-5 sm:px-8 md:absolute md:inset-0 md:grid md:min-h-[min(75vh,820px)] md:grid-cols-12 md:items-center md:px-10 md:pb-48 md:pt-6 lg:px-14">
          <div className="md:col-span-6 lg:col-span-5 lg:pr-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ansa-accent sm:text-sm">
              Developing athletes. Building leaders.
            </p>
            <h1 className="font-display mt-3 text-[1.75rem] font-extrabold leading-[1.08] tracking-tight sm:mt-4 sm:text-4xl md:text-[2.75rem] lg:text-5xl">
              <span className="block italic text-white">ELEVATE YOUR GAME.</span>
              <span className="mt-1 block italic text-ansa-accent">CHANGE YOUR LIFE.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
              At ANSA Basketball Academy, we train the next generation of athletes on and off the
              court.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-ansa-accent px-8 font-bold text-white shadow-lg hover:bg-orange-600"
                )}
              >
                Join Now →
              </Link>
              <Link
                href="/programs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-2 border-white/90 bg-transparent px-8 font-semibold text-white hover:bg-white/10"
                )}
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>

        {/* Feature bar — desktop, nudged below hero base so ball/hand stay visible */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-7 px-5 lg:translate-y-8 lg:px-6">
          <div className="mx-auto max-w-7xl rounded-t-2xl border border-b-0 border-gray-100/90 bg-white px-8 py-7 shadow-[0_-8px_40px_-12px_rgba(0,31,63,0.12)]">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-5">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-ansa-accent">
                    {feature.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-ansa-primary">
                      {feature.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats-section" className="bg-gray-50 py-20 pt-16 sm:pt-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg shadow-gray-200/40 transition hover:-translate-y-1 hover:shadow-xl"
            >
              {(stat as { isLocation?: boolean }).isLocation ? (
                <p className="font-display text-2xl font-bold italic text-ansa-primary md:text-3xl">
                  Nairobi
                </p>
              ) : (
                <p className="font-display text-4xl font-bold italic text-ansa-accent md:text-5xl">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
              )}
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ansa-accent">Our mission</p>
          <h2 className="font-display mt-3 text-3xl font-extrabold italic text-ansa-primary md:text-4xl">
            More than basketball
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700">
            Developing basketball skills, character, and opportunities for youth across Nairobi.
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Professional coaching for kids and beginners, with training focused on fundamentals,
            discipline, and growth.
          </p>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mt-8 border-2 border-ansa-primary font-semibold text-ansa-primary hover:bg-ansa-primary hover:text-white"
            )}
          >
            Learn More
          </Link>
        </div>
      </section>

      <GalleryCarousel />

      {/* Programs */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ansa-accent">Train with us</p>
            <h2 className="font-display mt-3 text-3xl font-extrabold italic text-ansa-primary md:text-4xl">
              Our Programs
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Training Sessions",
                desc: "Regular structured training to build fundamentals, conditioning, and game IQ.",
              },
              {
                title: "Skill Clinics",
                desc: "Focused clinics on shooting, ball-handling, defense, and position-specific skills.",
              },
              {
                title: "Games & Tournaments",
                desc: "Competitive play and tournaments to test skills and build experience.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:border-ansa-accent/30 hover:shadow-xl"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-ansa-accent transition group-hover:bg-ansa-accent group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ansa-primary">{p.title}</h3>
                <p className="mt-4 text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/programs"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-ansa-accent px-10 font-bold text-white shadow-lg hover:bg-orange-600"
              )}
            >
              View All Programs
            </Link>
            <Link
              href="/merchandise"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-2 border-ansa-primary px-10 font-semibold text-ansa-primary hover:bg-ansa-primary hover:text-white"
              )}
            >
              Shop merchandise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
