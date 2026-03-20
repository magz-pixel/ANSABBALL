import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const PROGRAMS = [
  {
    title: "Weekend Training",
    schedule: "Saturdays 11:30AM–1:30PM, Sundays 2:00PM–4:00PM",
    venue: "Marist University",
    pricing: "Monthly KES 4,000 | Registration KES 2,500",
    requirement: "Own basketball",
    desc: "Fun, skill-focused sessions for youth.",
    image: "/gallery/gallery-1.png",
  },
  {
    title: "Weekday / Holiday Training",
    schedule: "Mon–Sat 10:30AM–12:30PM",
    venue: "Marist College, Karen (e.g., Nov 3–Dec 20)",
    pricing:
      "Reg KES 2,500 | Session (6 wks) KES 21,000 | Weekly KES 4,000 | Daily KES 1,000",
    requirement: "Own basketball",
    desc: "Categories: Under 5 to Under 17/Senior. Intensive sessions during school breaks.",
    image: "/gallery/gallery-4.png",
  },
  {
    title: "School Coaching",
    schedule: "Custom",
    venue: "Partner schools",
    pricing: "Contact for custom packages",
    requirement: "—",
    desc: "Partner with schools to set up basketball programs. We provide certified coaches, curriculum, and equipment setup.",
    image: "/gallery/gallery-5.png",
  },
  {
    title: "Skill Clinics",
    schedule: "Scheduled sessions",
    venue: "Marist venues",
    pricing: "KES 1,500/session",
    requirement: "—",
    desc: "Specialized drills for dribbling, shooting, defense. Open to all levels.",
    image: "/gallery/gallery-3.png",
  },
];

export default function ProgramsPage() {
  return (
    <div>
      {/* Banner */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden bg-[#001F3F] px-4">
        <Image
          src="/gallery/gallery-7.png"
          alt="ANSA Basketball Academy"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#001F3F]/80" />
        <h1 className="relative z-10 text-4xl font-bold text-white md:text-5xl">
          Our Programs
        </h1>
      </section>

      {/* Program cards */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {PROGRAMS.map((p) => (
              <div
                key={p.title}
                className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white drop-shadow-lg">
                    {p.title}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-black/80">{p.schedule}</p>
                  <p className="mt-1 text-sm text-[#0066CC]">{p.venue}</p>
                  <p className="mt-4 text-black/75">{p.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-black/90">{p.pricing}</p>
                  <p className="mt-1 text-xs text-black/60">Requirement: {p.requirement}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/auth/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#0066CC] px-10 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
              )}
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
