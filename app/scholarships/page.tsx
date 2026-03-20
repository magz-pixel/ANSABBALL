import Image from "next/image";
import { ScholarshipForm } from "@/components/scholarship-form";
import { cn } from "@/lib/utils";

const ELIGIBILITY = [
  "Ages 5–17",
  "Demonstrate financial need",
  "Passion for basketball",
  "Good academic standing",
];

const SUCCESS_STORIES = [
  {
    name: "Medal Winners",
    story: "Our athletes consistently achieve at competitions. Scholarships help talented youth from families in need reach their potential.",
    image: "/gallery/gallery-2.png",
    alt: "ANSA athletes with medals",
  },
  {
    name: "Young Champions",
    story: "From Under 5 to Senior divisions – our scholarship recipients grow in skill and character on and off the court.",
    image: "/gallery/gallery-4.png",
    alt: "Young ANSA athletes",
  },
  {
    name: "Our Family",
    story: "Every scholarship recipient becomes part of the ANSA family. We invest in youth who show dedication and heart.",
    image: "/gallery/gallery-7.png",
    alt: "ANSA Basketball Academy team",
  },
];

export default function ScholarshipsPage() {
  return (
    <div>
      {/* Banner */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden bg-[#001F3F] px-4">
        <Image
          src="/gallery/gallery-2.png"
          alt="ANSA scholarship recipients"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[#001F3F]/80" />
        <h1 className="relative z-10 text-4xl font-bold text-white md:text-5xl">
          Scholarship Program
        </h1>
      </section>

      {/* Intro */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-lg leading-relaxed text-black/85">
            ANSA offers scholarships for talented youth from families in need.
            Apply below to join our programs at reduced or no cost.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-6 text-xl font-bold text-[#001F3F]">Eligibility</h2>
          <ul className="space-y-3">
            {ELIGIBILITY.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-black/85"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0066CC] text-sm font-bold text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="mb-6 text-xl font-bold text-[#001F3F]">Apply Now</h2>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white p-8 shadow-lg shadow-gray-200/50">
            <ScholarshipForm />
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#001F3F]">
            Success Stories
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {SUCCESS_STORIES.map((s) => (
              <div
                key={s.name}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-[#001F3F]">{s.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/75">{s.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-lg text-black/85">
            Questions? Call{" "}
            <a
              href="tel:0718082452"
              className={cn(
                "font-semibold text-[#0066CC] transition-colors hover:text-blue-700 hover:underline"
              )}
            >
              0718082452
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
