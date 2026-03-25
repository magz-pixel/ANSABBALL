/**
 * ANSA merchandise catalog — prices from client (March 2026).
 * Images: client photos in /public/merch where available; otherwise Unsplash product-style shots.
 */

export type MerchCategory =
  | "balls"
  | "apparel"
  | "equipment"
  | "protection"
  | "officiating"
  | "services";

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  /** Use 0 when contactForQuote (not sold via cart). */
  priceKes: number;
  category: MerchCategory;
  imageUrl: string;
  imageAlt: string;
  /** Size / colour options where relevant */
  sizes?: string[];
  /** Colour variants or stock note (shown under description) */
  variantNote?: string;
  /** Not purchasable online — show contact / quote CTA instead of cart. */
  contactForQuote?: boolean;
}

const US = "https://images.unsplash.com";

function u(photoId: string, w = 900): string {
  return `${US}/${photoId}?auto=format&fit=crop&w=${w}&q=80`;
}

export const MERCH_CATEGORIES: { id: MerchCategory; label: string }[] = [
  { id: "balls", label: "Basketballs & balls" },
  { id: "apparel", label: "Socks & apparel" },
  { id: "equipment", label: "Equipment & bags" },
  { id: "protection", label: "Protection" },
  { id: "officiating", label: "Officiating" },
  { id: "services", label: "Court builds" },
];

export const PRODUCTS: Product[] = [
  // Basketballs & other balls — stock photos (replace with client pack shots anytime)
  {
    id: "ball-spalding",
    name: "Spalding NBA Street Performance Outdoor",
    shortDescription:
      "NBA Street line — performance outdoor grip, durable cover for concrete and asphalt.",
    priceKes: 2500,
    category: "balls",
    imageUrl: "/merch/ball-spalding-nba-street.png",
    imageAlt:
      "Spalding NBA Street Performance Outdoor basketball on white background",
    sizes: ["Size 5 (Youth)", "Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-molten-standard",
    name: "Molten Basketball",
    shortDescription: "Molten game ball — great grip and durability for training.",
    priceKes: 2500,
    category: "balls",
    imageUrl: u("photo-1627627256672-027a4613d028"),
    imageAlt: "Leather basketball on a neutral surface",
    sizes: ["Size 5 (Youth)", "Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-molten-bg4500",
    name: "Molten BG4500",
    shortDescription:
      "FIBA Approved Level 1 (2023–2027) premium composite — competition indoor game ball.",
    priceKes: 4500,
    category: "balls",
    imageUrl: "/merch/ball-molten-bg4500.png",
    imageAlt:
      "Molten BG4500 basketball with FIBA Approved and competition composite branding",
    sizes: ["Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-molten-d3500-outdoor",
    name: "Molten D3500 Outdoor",
    shortDescription:
      "Built tough for outdoor conditions — durable cover for asphalt and street courts.",
    priceKes: 6999,
    category: "balls",
    imageUrl: "/merch/ball-molten-d3500-outdoor.png",
    imageAlt:
      "Molten D3500 Outdoor basketball with D 3500 OUTDOOR branding on black background",
    sizes: ["Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-football",
    name: "Football (soccer ball)",
    shortDescription:
      "Kipsta official replica — UEFA Europa League design. Great for training and casual play.",
    priceKes: 2500,
    category: "balls",
    imageUrl: "/merch/ball-football-kipsta-europa.png",
    imageAlt:
      "Kipsta UEFA Europa League official replica soccer ball on white background",
    sizes: ["Size 4 (Youth)", "Size 5 (Official)"],
  },
  {
    id: "ball-volleyball",
    name: "Mikasa MV210 Volleyball",
    shortDescription:
      "Regular performance indoor ball — FIVB official ball designation on model.",
    priceKes: 2500,
    category: "balls",
    imageUrl: "/merch/ball-volleyball-mikasa-mv210.png",
    imageAlt:
      "Mikasa MV210 volleyball navy yellow and white with FIVB official ball marking",
    sizes: ["Standard"],
  },
  // Apparel — client photo (soft dotted / Kobe Elite line)
  {
    id: "socks-soft-dotted",
    name: 'Nike Elite “soft dotted” socks (pair)',
    shortDescription:
      "Performance crew socks — soft dotted texture (e.g. Nike Elite / Mamba line). Subject to stock.",
    priceKes: 3000,
    category: "apparel",
    imageUrl: "/merch/socks-nike-mamba-kobe.png",
    imageAlt: "Nike Elite soft dotted basketball socks",
    sizes: ["S", "M", "L (EUR 42–46)"],
    variantNote:
      "Pattern may vary by batch; we’ll match the soft-dotted style where possible.",
  },
  // Protection
  {
    id: "knee-pads-pair",
    name: "Knee pads (pair)",
    shortDescription: "Protective knee pads for training and games — Nike Pro / similar quality.",
    priceKes: 2500,
    category: "protection",
    imageUrl: "/merch/compression-nike-pro.png",
    imageAlt: "Nike Pro athletic knee support gear",
    sizes: ["S", "M", "L", "XL"],
    variantNote: "Brand/style may vary; equivalent protection guaranteed.",
  },
  {
    id: "mouth-guard",
    name: "Mouth guard",
    shortDescription: "Shock-absorbing mouthguard for contact drills and games.",
    priceKes: 1350,
    category: "protection",
    imageUrl: u("photo-1564420159030-ad05d6fbc24e"),
    imageAlt: "Clear mouldable mouthguard on a table (stock photo)",
    sizes: ["Youth", "Adult"],
  },
  // Officiating — Molten Blazza (client photo)
  {
    id: "whistle-molten-blazza",
    name: "Molten Blazza Whistle",
    shortDescription:
      "Professional pea-less referee whistle — sharp, consistent tone. Includes black lanyard.",
    priceKes: 1000,
    category: "officiating",
    imageUrl: "/merch/whistle-molten-blazza.png",
    imageAlt: "Molten Blazza black whistle with black braided lanyard",
  },

  // Equipment — client photos (prices are indicative Kenya retail estimates unless confirmed)
  {
    id: "rim-net-set-wall-mount",
    name: "Basketball rim & net set",
    shortDescription:
      "Heavy-duty rim with tri-colour net and spare net — wall/backboard mount bracket.",
    priceKes: 5500,
    category: "equipment",
    imageUrl: "/merch/equipment-rim-net-set.png",
    imageAlt:
      "Red metal basketball rim with red white blue net and spare net on white background",
    variantNote:
      "Indicative Kenya market price — we’ll confirm before payment. Hardware as shown.",
  },
  {
    id: "backpack-nike-elite-basketball",
    name: "Nike Elite basketball backpack",
    shortDescription:
      "Large team bag — separate shoe/ball compartment, vented side pocket, durable shell.",
    priceKes: 10500,
    category: "equipment",
    imageUrl: "/merch/backpack-nike-elite-silver.png",
    imageAlt: "Black Nike Elite backpack with silver swoosh and ELITE lettering",
    variantNote: "Indicative Kenya retail estimate — confirm colour/stock when ordering.",
  },

  // Apparel — NBA socks & balaclava (client photos)
  {
    id: "socks-nike-elite-quick-nba-black",
    name: "Nike Elite Quick NBA crew socks (pair)",
    shortDescription:
      "NBA Logoman — black knit with yellow accents; Elite Quick cushioning.",
    priceKes: 1900,
    category: "apparel",
    imageUrl: "/merch/socks-nike-elite-quick-nba-black.png",
    imageAlt:
      "Nike Elite Quick NBA crew socks black with yellow details on retail tag",
    sizes: ["S", "M", "L (EUR 42–46)"],
    variantNote:
      "Indicative price vs local Nike/NBA stockists. Size subject to availability.",
  },
  {
    id: "socks-nike-elite-quick-nba-marled",
    name: "Nike Elite Quick NBA crew socks — marled (pair)",
    shortDescription:
      "NBA Logoman — marled black/grey/white pattern with red stripe accents.",
    priceKes: 1900,
    category: "apparel",
    imageUrl: "/merch/socks-nike-elite-quick-nba-marled.png",
    imageAlt:
      "Nike Elite Quick NBA crew socks with marled pixel pattern on packaging",
    sizes: ["S", "M", "L (EUR 42–46)"],
    variantNote:
      "Second colourway — same line as Elite Quick NBA. Stock may rotate.",
  },
  {
    id: "balaclava-nike-performance-black",
    name: "Nike performance balaclava (black)",
    shortDescription:
      "Full head and neck coverage — lightweight stretch fabric, Dri-FIT-style wear.",
    priceKes: 3200,
    category: "apparel",
    imageUrl: "/merch/balaclava-nike-black.png",
    imageAlt: "Black Nike balaclava with white swoosh on white background",
    sizes: ["One size"],
    variantNote: "Indicative Kenya retail estimate for Nike hood/balaclava styles.",
  },

  // Services — court construction (quote only)
  {
    id: "service-court-construction",
    name: "Outdoor basketball court construction",
    shortDescription:
      "Design and build outdoor courts — surfacing, hoops, fencing, and lighting options.",
    priceKes: 0,
    category: "services",
    imageUrl: "/merch/service-court-build.png",
    imageAlt: "Outdoor basketball court with blue surface glass backboards and floodlights",
    contactForQuote: true,
    variantNote:
      "Tell us location, size, and budget — we’ll scope materials and timeline.",
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatKes(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Price line for product cards (quote-only services have no cash price). */
export function formatProductPrice(product: Product): string {
  if (product.contactForQuote) return "Contact for quote";
  return formatKes(product.priceKes);
}

export const MPESA_CONFIG = {
  businessName: "ANSA Basketball Academy",
  tillNumber: "0000000",
  paybillNumber: "",
  tagline: "Pay via M-Pesa. Use your order number as the account reference where applicable.",
  supportPhone: "0718082452",
  supportWhatsAppHint:
    "After paying, send your order number and M-Pesa confirmation SMS to WhatsApp for fulfilment.",
} as const;

/** E.164 without + for wa.me links (254… Kenya). */
export const WHATSAPP_E164_LOCAL = "254718082452";

export function whatsappInquiryUrl(message: string): string {
  const q = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_E164_LOCAL}?text=${q}`;
}

export function lineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? "__default__"}`;
}
