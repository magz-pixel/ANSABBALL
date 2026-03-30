import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANSA Basketball Academy",
  description: "Developing the next generation of basketball talent",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
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
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.variable} min-w-0 font-sans antialiased overflow-x-hidden text-ansa-primary`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-1px)] min-w-0 bg-white text-ansa-primary">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
