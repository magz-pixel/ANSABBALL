"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  MERCH_CATEGORIES,
  PRODUCTS,
  formatKes,
  type MerchCategory,
  type Product,
} from "@/lib/merchandise";
import { Button } from "@/components/ui/button";
import { useMerchCart } from "./cart-context";

export function MerchandiseShop() {
  const [category, setCategory] = useState<MerchCategory | "all">("all");
  const { addItem } = useMerchCart();

  const filtered = useMemo(() => {
    if (category === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === category);
  }, [category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="mb-6 text-center text-sm text-gray-600 md:text-base">
        Official ANSA stock — balls, socks, protection, and officiating gear.
        Add items to your cart, then pay with{" "}
        <strong className="text-[#001F3F]">M-Pesa</strong> using your order
        number.
      </p>

      {/* Category filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            category === "all"
              ? "bg-[#0066CC] text-white shadow-md"
              : "bg-gray-100 text-[#001F3F] hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {MERCH_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              category === c.id
                ? "bg-[#0066CC] text-white shadow-md"
                : "bg-gray-100 text-[#001F3F] hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <span className="absolute left-3 top-3 rounded-full bg-[#001F3F]/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {MERCH_CATEGORIES.find((c) => c.id === product.category)
                  ?.label ?? product.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-bold text-[#001F3F]">
                {product.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                {product.shortDescription}
              </p>
              {product.variantNote ? (
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {product.variantNote}
                </p>
              ) : null}
              <p className="mt-4 text-xl font-bold text-[#0066CC]">
                {formatKes(product.priceKes)}
              </p>
              <ProductAddControls product={product} onAdd={addItem} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ProductAddControls({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (id: string, qty?: number, size?: string) => void;
}) {
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const hasSizes = Boolean(product.sizes?.length);
  const optionLabel =
    product.category === "officiating" ? "Colour" : "Size";

  return (
    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      {hasSizes ? (
        <label className="block text-xs font-medium text-gray-700">
          {optionLabel}
          <select
            className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#001F3F]"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            {product.sizes!.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button
        type="button"
        className="w-full bg-[#0066CC] font-semibold text-white hover:bg-blue-700"
        onClick={() => onAdd(product.id, 1, hasSizes ? size : undefined)}
      >
        Add to cart
      </Button>
    </div>
  );
}
