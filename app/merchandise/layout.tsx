import type { Metadata } from "next";
import { MerchandiseCartProvider } from "@/components/merchandise/cart-context";
import { MerchNavBar } from "@/components/merchandise/merch-nav-bar";

export const metadata: Metadata = {
  title: "Merchandise & Basketball Gear",
  description:
    "Official ANSA Basketball Academy merchandise — kits and gear in Nairobi, Kenya. Support the academy and shop online. M-Pesa accepted.",
  alternates: { canonical: "/merchandise" },
  openGraph: {
    title: "ANSA Merchandise | Basketball Academy Kenya",
  },
};

export default function MerchandiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MerchandiseCartProvider>
      <MerchNavBar />
      {children}
    </MerchandiseCartProvider>
  );
}
