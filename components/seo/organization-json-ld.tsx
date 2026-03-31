import { siteName, siteUrl } from "@/lib/seo-config";

/** SportsOrganization + LocalBusiness JSON-LD for rich results */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["SportsOrganization", "LocalBusiness"],
    "@id": `${siteUrl}/#organization`,
    name: siteName,
    description:
      "Youth and kids basketball training in Nairobi, Kenya — coaching, skill development, and competitive opportunities.",
    url: siteUrl,
    logo: `${siteUrl}/hero.png`,
    image: `${siteUrl}/hero.png`,
    telephone: "+254718082452",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi County",
      addressCountry: "KE",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Nairobi, Kenya",
    },
    priceRange: "$$",
    sameAs: [
      "https://www.instagram.com/AnsaBasketball",
      "https://www.facebook.com/AnsaBasketball",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
