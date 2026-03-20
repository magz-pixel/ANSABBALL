/**
 * ANSA merchandise catalog — update prices and copy with your client.
 * Images: Unsplash (basketball / sport photography).
 */

export type MerchCategory = "shoes" | "kits" | "gear";

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  priceKes: number;
  category: MerchCategory;
  /** Full Unsplash image URL */
  imageUrl: string;
  imageAlt: string;
  /** Available for shoes & kits; omit for one-size gear */
  sizes?: string[];
}

export const MERCH_CATEGORIES: { id: MerchCategory; label: string }[] = [
  { id: "shoes", label: "Basketball shoes" },
  { id: "kits", label: "Kits & apparel" },
  { id: "gear", label: "Gear & equipment" },
];

export const PRODUCTS: Product[] = [
  // Shoes — real sneaker / court photos
  {
    id: "shoe-pro-court",
    name: "Pro Court High-Tops",
    shortDescription: "Ankle support and grip for indoor hardwood — academy pick.",
    priceKes: 8999,
    category: "shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Red basketball sneaker on orange background",
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
  },
  {
    id: "shoe-crossover",
    name: "Crossover Trainer",
    shortDescription: "Lightweight trainer for drills and daily practice.",
    priceKes: 6499,
    category: "shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80",
    imageAlt: "White and green basketball shoes on court",
    sizes: ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11"],
  },
  {
    id: "shoe-elite-low",
    name: "Elite Low-Cut",
    shortDescription: "Speed and court feel for guards and wings.",
    priceKes: 7499,
    category: "shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Nike basketball sneakers on display",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
  },
  {
    id: "shoe-youth-starter",
    name: "Youth Starter",
    shortDescription: "Durable starter shoe for U12–U16 training.",
    priceKes: 4499,
    category: "shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1515524738708-3279986ef898?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Colorful athletic sneakers",
    sizes: ["US 4", "US 5", "US 6", "US 7"],
  },
  // Kits
  {
    id: "kit-home-jersey",
    name: "Academy Home Jersey",
    shortDescription: "Breathable mesh jersey — ANSA colours (mockup style).",
    priceKes: 2499,
    category: "kits",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Basketball player in jersey holding ball",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    id: "kit-practice-reversible",
    name: "Practice Reversible",
    shortDescription: "Two colours in one — perfect for scrimmages.",
    priceKes: 3299,
    category: "kits",
    imageUrl:
      "https://images.unsplash.com/photo-1519861537743-4c66769d433f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Basketball game action on court",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "kit-shorts",
    name: "Performance Shorts",
    shortDescription: "Lightweight shorts with pockets for small items.",
    priceKes: 1799,
    category: "kits",
    imageUrl:
      "https://images.unsplash.com/photo-1519869311094-5bf5fbce704f?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Basketball shorts and sneakers flat lay style",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "kit-tracksuit",
    name: "Warm-Up Tracksuit",
    shortDescription: "Jacket and pants for travel and pre-game warm-ups.",
    priceKes: 5499,
    category: "kits",
    imageUrl:
      "https://images.unsplash.com/photo-1556906682-4d8f2b47a6f3?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Athletic tracksuit lifestyle",
    sizes: ["S", "M", "L", "XL"],
  },
  // Gear
  {
    id: "gear-official-ball",
    name: "Official Indoor Ball",
    shortDescription: "Size 7 composite leather — game ready.",
    priceKes: 4999,
    category: "gear",
    imageUrl:
      "https://images.unsplash.com/photo-1546510770-a68da103a2be?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Basketball on outdoor court",
    sizes: ["Size 6 (Youth)", "Size 7 (Official)"],
  },
  {
    id: "gear-duffel",
    name: "Team Duffel Bag",
    shortDescription: "Fits shoes, ball, and kit — ventilated shoe pocket.",
    priceKes: 2899,
    category: "gear",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Black gym duffel bag",
  },
  {
    id: "gear-sleeves",
    name: "Compression Sleeves (pair)",
    shortDescription: "Arm or leg sleeves for support and style.",
    priceKes: 1299,
    category: "gear",
    imageUrl:
      "https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Athletic training and basketball gear",
  },
  {
    id: "gear-cones",
    name: "Training Cone Set (6)",
    shortDescription: "Agility cones for footwork and conditioning drills.",
    priceKes: 1999,
    category: "gear",
    imageUrl:
      "https://images.unsplash.com/photo-1519865966640-977f6d7cb93b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Basketball training on court",
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

/**
 * Replace with your client’s real M-Pesa Till / Paybill from Safaricom.
 * Payment API can be wired later.
 */
export const MPESA_CONFIG = {
  /** Display name on customer’s phone */
  businessName: "ANSA Basketball Academy",
  /** Lipa na M-Pesa → Buy Goods & Services */
  tillNumber: "0000000",
  /** If you use Paybill instead, set and show in checkout */
  paybillNumber: "",
  /** Short note for customers */
  tagline: "Pay via M-Pesa. Use your order number as the account reference where applicable.",
  supportPhone: "0718082452",
  supportWhatsAppHint:
    "After paying, send your order number and M-Pesa confirmation SMS to WhatsApp for fulfilment.",
} as const;

export function lineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? "__default__"}`;
}
