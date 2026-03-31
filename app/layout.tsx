import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import {
  defaultDescription,
  seoKeywords,
  siteName,
  siteUrl,
} from "@/lib/seo-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Basketball Training Nairobi, Kenya`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: seoKeywords,
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: siteUrl,
    siteName,
    title: `${siteName} — Youth & Kids Basketball in Nairobi`,
    description: defaultDescription,
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "ANSA Basketball Academy — basketball training in Nairobi, Kenya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Basketball Academy Kenya`,
    description: defaultDescription,
  },
  category: "sports",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001F3F",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE" className="overflow-x-hidden">
      <body
        className={`${inter.variable} min-w-0 font-sans antialiased overflow-x-hidden text-ansa-primary`}
      >
        <OrganizationJsonLd />
        <Navbar />
        <main className="min-h-[calc(100vh-1px)] min-w-0 bg-white text-ansa-primary">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
