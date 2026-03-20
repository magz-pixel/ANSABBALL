import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const PHILOSOPHY_POINTS = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Discipline & Work Ethic",
    desc: "Consistent training builds habits that translate to school and future success.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Teamwork & Communication",
    desc: "Learning to pass, support, and communicate on the court fosters collaboration and respect.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Resilience & Leadership",
    desc: "Facing challenges in games teaches perseverance, bouncing back from setbacks, and stepping up as a leader.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Active Lifestyle & Health",
    desc: "We promote lifelong fitness, balanced nutrition, and mental well-being beyond pro aspirations.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Character & Sportsmanship",
    desc: "Integrity, humility, and fair play—values that shape responsible young adults.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero banner */}
      <section className="flex min-h-[50vh] flex-col items-center justify-center bg-[#001F3F] px-4 text-center">
        <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          About ANSA Basketball Academy
        </h1>
        <p className="mt-6 max-w-2xl text-xl text-white/90 md:text-2xl">
          More Than Basketball – Building Life Champions in Nairobi
        </p>
      </section>

      {/* Founder */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-[#001F3F]">
            Meet Founder Brian Otieno
          </h2>
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
            <div className="relative aspect-square w-56 shrink-0 overflow-hidden rounded-full shadow-xl ring-2 ring-gray-100 sm:w-64">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Brian Otieno, ANSA founder"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 224px, 256px"
              />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <p className="text-lg leading-relaxed text-black/85">
                Brian, a passionate Nairobi-based coach with 15+ years experience,
                founded ANSA to empower youth through basketball. From small park
                sessions to 50+ athletes today, his vision: Use the game to develop
                skills for life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / Why Join */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-[#001F3F] md:text-3xl">
            Why Choose ANSA? Basketball as a Tool for Life
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-black/85">
            <p>
              Basketball is more than a sport at ANSA—it&apos;s an enabler for
              personal growth. We focus on:
            </p>
            <ul className="space-y-4 pl-6">
              <li className="list-disc">
                <strong>Discipline & Work Ethic:</strong> Consistent training
                builds habits that translate to school and future success.
              </li>
              <li className="list-disc">
                <strong>Teamwork & Communication:</strong> Learning to pass,
                support, and communicate on the court fosters collaboration and
                respect.
              </li>
              <li className="list-disc">
                <strong>Resilience & Leadership:</strong> Facing challenges in
                games teaches perseverance, bouncing back from setbacks, and
                stepping up as a leader.
              </li>
              <li className="list-disc">
                <strong>Active Lifestyle & Health:</strong> We promote lifelong
                fitness, balanced nutrition, and mental well-being beyond pro
                aspirations.
              </li>
              <li className="list-disc">
                <strong>Character & Sportsmanship:</strong> Integrity, humility,
                and fair play—values that shape responsible young adults.
              </li>
            </ul>
            <p>
              While we celebrate talent and aim high, our priority is holistic
              development: Helping every child become confident, disciplined, and
              team-oriented for life beyond the court.
            </p>
          </div>

          {/* What Sets ANSA Apart */}
          <div className="mt-16">
            <h2 className="mb-8 inline-block border-b-4 border-[#0066CC] pb-2 text-2xl font-bold text-[#001F3F]">
              What Sets ANSA Apart
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-relaxed text-black/85">
              <p>
                At ANSA, we&apos;re not just another basketball academy—we&apos;re
                tech-forward in a way that truly benefits you and your child.
              </p>
              <p className="font-medium">What makes us different:</p>
              <ul className="space-y-4 pl-6">
                <li className="list-disc">
                  <strong>Your Own Intelligent Player Profile:</strong> Every
                  enrolled player gets a private, personalized dashboard. Parents
                  and kids can log in anytime to see real progress—skills
                  improving over time, attendance records, coach notes, and simple
                  charts showing growth in dribbling, shooting, defense, and more.
                </li>
                <li className="list-disc">
                  <strong>Easy Tracking On and Off the Court:</strong> Coaches
                  input updates after every session, and you see them instantly.
                  Kids can log home practice or journal thoughts, turning
                  basketball into a habit-building journey.
                </li>
                <li className="list-disc">
                  <strong>Smart Insights to Motivate:</strong> We use simple tools
                  (with AI smarts coming soon) to highlight strengths, suggest
                  focus areas, and celebrate milestones—helping build confidence,
                  discipline, and teamwork beyond just scores.
                </li>
                <li className="list-disc">
                  <strong>Peace of Mind for Parents:</strong> No more wondering if
                  fees are worth it or how your child is doing. Get clear
                  visibility into their development, attendance, and coach
                  feedback, so you feel connected and confident in their growth.
                </li>
              </ul>
              <p>
                This proprietary system saves coaches time, keeps everyone
                motivated, and makes ANSA a true partner in your child&apos;s
                holistic success—on the court and in life.
              </p>
            </div>
          </div>

          {/* Icon cards grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PHILOSOPHY_POINTS.map((point) => (
              <div
                key={point.title}
                className="group rounded-xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-[#0066CC]/20 hover:shadow-xl"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#0066CC]/10 text-[#0066CC] transition-colors group-hover:bg-[#0066CC] group-hover:text-white">
                  {point.icon}
                </div>
                <h3 className="font-semibold text-[#001F3F]">{point.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/75">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Link
            href="/auth/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#0066CC] px-10 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
            )}
          >
            Join Our Family
          </Link>
        </div>
      </section>
    </div>
  );
}
