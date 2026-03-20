"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatKes, lineKey } from "@/lib/merchandise";
import { useMerchCart } from "./cart-context";

export function CartPageClient() {
  const { linesWithProducts, subtotalKes, setQuantity, removeLine } =
    useMerchCart();

  if (linesWithProducts.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Your cart is empty.</p>
        <Link href="/merchandise">
          <Button className="mt-6 bg-[#0066CC] text-white hover:bg-blue-700">
            Browse shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#001F3F]">Your cart</h1>
      <ul className="mt-8 divide-y divide-gray-100">
        {linesWithProducts.map(({ line, product }) => {
          const key = lineKey(line.productId, line.size);
          return (
            <li key={key} className="flex gap-4 py-6">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-28 sm:w-28">
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-[#001F3F]">{product.name}</h2>
                {line.size ? (
                  <p className="text-sm text-gray-500">Size: {line.size}</p>
                ) : null}
                <p className="mt-1 text-[#0066CC] font-semibold">
                  {formatKes(product.priceKes)} each
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="w-16 rounded-md border border-gray-200 px-2 py-1 text-[#001F3F]"
                      value={line.quantity}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!Number.isFinite(n)) return;
                        setQuantity(line.productId, n, line.size);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-sm font-medium text-red-600 hover:underline"
                    onClick={() => removeLine(line.productId, line.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#001F3F]">
                  {formatKes(product.priceKes * line.quantity)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-gray-700">Subtotal</span>
          <span className="text-2xl font-bold text-[#001F3F]">
            {formatKes(subtotalKes)}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Shipping or pickup can be confirmed after payment. You’ll use{" "}
          <strong>M-Pesa</strong> on the next step.
        </p>
        <Link href="/merchandise/checkout" className="mt-6 block">
          <Button className="w-full bg-[#0066CC] py-6 text-base font-semibold text-white hover:bg-blue-700">
            Proceed to checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
