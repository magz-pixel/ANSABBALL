import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { AnimatedCounter } from "@/components/animated-counter";

const STATS = [
  { value: 50, suffix: "+", label: "Players" },
  { value: 15, suffix: "+", label: "Scholarships" },
  { value: 12, suffix: "", label: "Weekly Sessions" },
  { value: 0, suffix: "", label: "Nairobi, Kenya", isLocation: true },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] w-full overflow-hidden">
        <Image
          src="/hero.png"
          alt="ANSA Basketball Academy team celebrating together – Nairobi, Kenya"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/50"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-6 py-16 text-center text-white sm:px-10">
          <h1 className="max-w-5xl text-4xl font-bold leading-tight tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-5xl md:text-6xl lg:text-7xl">
            ANSA Basketball Academy
          </h1>
          <p className="mt-4 max-w-2xl text-xl font-medium tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)] sm:text-2xl">
            Building Nairobi&apos;s Future Stars
          </p>
          <p className="mt-6 max-w-xl text-base text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-lg">
            Elite youth training, scholarships & progress tracking
          </p>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#0066CC] px-8 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
              )}
            >
              Join Now →
            </Link>
            <Link
              href="/scholarships"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-2 border-white px-8 font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
              )}
            >
              Apply for Scholarship
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats-section" className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
            >
              {(stat as { isLocation?: boolean }).isLocation ? (
                <p className="text-2xl font-bold text-[#001F3F] md:text-3xl">
                  Nairobi
                </p>
              ) : (
                <p className="text-4xl font-bold text-[#0066CC] md:text-5xl">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
              )}
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-[#001F3F]">Our Mission</h2>
          <p className="mt-6 text-lg leading-relaxed text-black/80">
            Developing basketball skills, character, and opportunities for
            youth in need across Nairobi.
          </p>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "mt-8 border-2 border-[#001F3F] text-[#001F3F] transition-all hover:bg-[#001F3F] hover:text-white"
            )}
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Carousel Gallery */}
      <GalleryCarousel />

      {/* Programs */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#001F3F]">
            Our Programs
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
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
                className="group rounded-xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-[#0066CC]/20 hover:shadow-xl hover:shadow-[#0066CC]/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#0066CC]/10 text-[#0066CC] transition-colors group-hover:bg-[#0066CC] group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#001F3F]">{p.title}</h3>
                <p className="mt-4 text-black/70">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/programs"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#0066CC] px-10 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
              )}
            >
              View All Programs
            </Link>
            <Link
              href="/merchandise"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-2 border-[#001F3F] px-10 font-semibold text-[#001F3F] transition-all hover:scale-105 hover:bg-[#001F3F] hover:text-white"
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
