/**
 * Canonical site URL for metadata, Open Graph, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://ansabasketballacademy.co.ke).
 */
export const siteUrl =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : null) ?? "https://ansabasketballacademy.co.ke";

export const siteName = "ANSA Basketball Academy";

/** Primary + long-tail phrases for Kenya / Nairobi basketball training */
export const seoKeywords: string[] = [
  "basketball academy Kenya",
  "basketball training Nairobi",
  "youth basketball academy Kenya",
  "basketball coaching for kids Nairobi",
  "professional basketball training Kenya",
  "basketball academy near me",
  "kids basketball training Nairobi",
  "basketball training for beginners Kenya",
  "best basketball academy in Nairobi",
  "Nairobi basketball",
  "Karen basketball training",
  "Marist College Karen basketball",
];

export const defaultDescription =
  "ANSA Basketball Academy — professional youth basketball training in Nairobi, Kenya. Kids basketball coaching, beginner-friendly sessions, weekend & holiday programs, and scholarships. Find a basketball academy near you in Karen & Nairobi.";
