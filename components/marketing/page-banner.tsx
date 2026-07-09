import { cn } from "@/lib/utils";

export function PageBanner({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-ansa-primary px-4 py-20 text-center md:py-24",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.18),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ansa-accent md:text-sm">
          ANSA Basketball Academy
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold italic tracking-tight text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85 md:text-xl">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
