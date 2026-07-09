import { PageBanner } from "@/components/marketing/page-banner";
import { MerchandiseShop } from "@/components/merchandise/merchandise-shop";

export default function MerchandisePage() {
  return (
    <div className="bg-white">
      <PageBanner
        title="ANSA Store"
        subtitle="Balls, protection & officiating — order online, pay with M-Pesa"
      />
      <MerchandiseShop />
    </div>
  );
}
