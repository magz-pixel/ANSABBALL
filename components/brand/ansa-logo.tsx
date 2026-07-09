import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/brand/ansa-logo.png";

export function AnsaLogo({
  href = "/",
  className,
  imageClassName,
  priority = false,
  variant = "default",
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** "light" inverts for dark backgrounds; "default" shows logo as-is on white */
  variant?: "default" | "light";
}) {
  const img = (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src={LOGO_SRC}
        alt="ANSA Basketball Academy"
        width={200}
        height={64}
        className={cn(
          "h-11 w-auto object-contain sm:h-12 md:h-[3.25rem]",
          variant === "light" && "brightness-0 invert",
          imageClassName
        )}
        priority={priority}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {img}
      </Link>
    );
  }

  return img;
}
