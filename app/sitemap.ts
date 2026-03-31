import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl;
  const routes = ["", "/about", "/programs", "/scholarships", "/merchandise"];
  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/programs" || path === "/about" ? 0.9 : 0.7,
  }));
}
