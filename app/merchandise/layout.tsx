import type { Metadata } from "next";
import { MerchandiseCartProvider } from "@/components/merchandise/cart-context";
import { MerchNavBar } from "@/components/merchandise/merch-nav-bar";

export const metadata: Metadata = {
  title: "Merchandise | ANSA Basketball Academy",
  description:
    "Basketball shoes, kits, and gear from ANSA Basketball Academy. Pay with M-Pesa.",
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
