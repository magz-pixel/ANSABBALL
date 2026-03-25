/**
 * ANSA merchandise catalog — prices from client (March 2026).
 * Images: client photos in /public/merch where available; otherwise Unsplash product-style shots.
 */

export type MerchCategory = "balls" | "apparel" | "protection" | "officiating";

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  priceKes: number;
  category: MerchCategory;
  imageUrl: string;
  imageAlt: string;
  /** Size / colour options where relevant */
  sizes?: string[];
  /** Colour variants or stock note (shown under description) */
  variantNote?: string;
}

const US = "https://images.unsplash.com";

function u(photoId: string, w = 900): string {
  return `${US}/${photoId}?auto=format&fit=crop&w=${w}&q=80`;
}

export const MERCH_CATEGORIES: { id: MerchCategory; label: string }[] = [
  { id: "balls", label: "Basketballs & balls" },
  { id: "apparel", label: "Socks & apparel" },
  { id: "protection", label: "Protection" },
  { id: "officiating", label: "Officiating" },
];

export const PRODUCTS: Product[] = [
  // Basketballs & other balls — stock photos (replace with client pack shots anytime)
  {
    id: "ball-spalding",
    name: "Spalding Basketball",
    shortDescription: "Official-style leather composite ball — indoor/outdoor use.",
    priceKes: 2500,
    category: "balls",
    imageUrl: u("photo-1650566924908-db62de4863af"),
    imageAlt: "Basketball on a clean white background",
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
    shortDescription: "Premium composite leather — FIBA-style indoor game ball.",
    priceKes: 4500,
    category: "balls",
    imageUrl: u("photo-1574629810360-7efbbe195018"),
    imageAlt: "Basketball on a hardwood court",
    sizes: ["Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-molten-d3500-outdoor",
    name: "Molten D3500 Outdoor",
    shortDescription: "Tough rubber cover for asphalt and outdoor courts.",
    priceKes: 6999,
    category: "balls",
    imageUrl: u("photo-1595795279832-13f0df36fbb9"),
    imageAlt: "Basketball on outdoor concrete",
    sizes: ["Size 6 (Women)", "Size 7 (Men)"],
  },
  {
    id: "ball-football",
    name: "Football (soccer ball)",
    shortDescription: "Training football for drills and casual play.",
    priceKes: 2500,
    category: "balls",
    imageUrl: u("photo-1551698618-1dfe5d97d256"),
    imageAlt: "Soccer ball on grass",
    sizes: ["Size 4 (Youth)", "Size 5 (Official)"],
  },
  {
    id: "ball-volleyball",
    name: "Volleyball",
    shortDescription: "Indoor/outdoor volleyball — academy stock.",
    priceKes: 2500,
    category: "balls",
    imageUrl: u("photo-1612872087720-bb876e2e67d1"),
    imageAlt: "Volleyball ball",
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
  // Officiating — client photo (Fox 40 CMG, multi-colour sheet)
  {
    id: "whistle-fox40-cmg",
    name: "Fox 40 CMG Whistle",
    shortDescription:
      "Pealess official whistle — cushioned mouth grip. Used in NBA, FIBA, and many leagues.",
    priceKes: 1000,
    category: "officiating",
    imageUrl: "/merch/whistle-fox40-colors.png",
    imageAlt: "Fox 40 CMG whistles in yellow, blue, black, and red",
    sizes: ["Yellow", "Blue", "Black", "Red"],
    variantNote:
      "Pick a colour when you order — stock rotates; we’ll confirm if your first choice is unavailable.",
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

export const MPESA_CONFIG = {
  businessName: "ANSA Basketball Academy",
  tillNumber: "0000000",
  paybillNumber: "",
  tagline: "Pay via M-Pesa. Use your order number as the account reference where applicable.",
  supportPhone: "0718082452",
  supportWhatsAppHint:
    "After paying, send your order number and M-Pesa confirmation SMS to WhatsApp for fulfilment.",
} as const;

export function lineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? "__default__"}`;
}
