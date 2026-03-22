import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function supabaseStoragePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    return {
      protocol: "https" as const,
      hostname: host,
      pathname: "/storage/v1/object/public/**" as const,
    };
  } catch {
    return null;
  }
}

const supabaseImage = supabaseStoragePattern();

const nextConfig: NextConfig = {
  /** Avoid wrong workspace root when a parent folder has another lockfile */
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
      ...(supabaseImage ? [supabaseImage] : []),
    ],
  },
};

export default nextConfig;
