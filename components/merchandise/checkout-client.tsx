"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatKes, MPESA_CONFIG } from "@/lib/merchandise";
import { generateOrderNumber } from "@/lib/order-number";
import { useMerchCart } from "./cart-context";

const ORDER_SESSION_KEY = "ansa_merch_order_draft";

export function CheckoutClient() {
  const {
    linesWithProducts,
    subtotalKes,
    clearCart,
    itemCount,
  } = useMerchCart();

  const [orderNumber, setOrderNumber] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = sessionStorage.getItem(ORDER_SESSION_KEY);
    if (existing) {
      setOrderNumber(existing);
      return;
    }
    const next = generateOrderNumber();
    sessionStorage.setItem(ORDER_SESSION_KEY, next);
    setOrderNumber(next);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number (M-Pesa).");
      return;
    }
    const code = mpesaCode.trim().toUpperCase();
    if (code.length < 8) {
      setError(
        "Enter your M-Pesa confirmation code (usually letters + numbers from the SMS)."
      );
      return;
    }
    sessionStorage.removeItem(ORDER_SESSION_KEY);
    clearCart();
    setSubmitted(true);
  };

  if (itemCount === 0 && !submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Your cart is empty.</p>
        <Link href="/merchandise">
          <Button className="mt-6 bg-[#0066CC] text-white hover:bg-blue-700">
            Go to shop
          </Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#001F3F]">
          Order received
        </h1>
        <p className="mt-3 text-gray-600">
          Thank you! We’ll verify your M-Pesa payment and contact you to arrange
          pickup or delivery.
        </p>
        <p className="mt-6 rounded-lg bg-gray-100 px-4 py-3 font-mono text-lg font-bold text-[#001F3F]">
          {orderNumber}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Save this order number for your records.
        </p>
        <Link href="/merchandise">
          <Button className="mt-8 bg-[#0066CC] text-white hover:bg-blue-700">
            Continue shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#001F3F]">Checkout</h1>
      <p className="mt-2 text-gray-600">
        Pay with M-Pesa, then submit your details and confirmation code below.
      </p>

      {/* Order number */}
      <section className="mt-8 rounded-xl border-2 border-dashed border-[#0066CC]/40 bg-[#0066CC]/5 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#001F3F]">
          Your order number
        </h2>
        <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-[#001F3F] md:text-3xl">
          {orderNumber || "…"}
        </p>
        <p className="mt-3 text-sm text-gray-700">
          Use this number as the <strong>Account / Reference</strong> when
          paying (if your M-Pesa menu asks for it). You’ll also enter your
          M-Pesa SMS confirmation code in the form below.
        </p>
      </section>

      {/* M-Pesa instructions */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#001F3F]">
          M-Pesa payment — {MPESA_CONFIG.businessName}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{MPESA_CONFIG.tagline}</p>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-800">
          <li>
            Open <strong>M-Pesa</strong> on your phone →{" "}
            <strong>Lipa na M-Pesa</strong> →{" "}
            <strong>Buy Goods and Services</strong>.
          </li>
          <li>
            Enter <strong>Till Number: {MPESA_CONFIG.tillNumber}</strong>
            <span className="text-amber-800">
              {" "}
              (placeholder — replace with your real Till in{" "}
              <code className="rounded bg-gray-100 px-1 text-xs">
                lib/merchandise.ts
              </code>
              )
            </span>
            .
          </li>
          <li>
            Enter amount:{" "}
            <strong className="text-[#0066CC]">{formatKes(subtotalKes)}</strong>{" "}
            (must match your cart total exactly).
          </li>
          <li>
            If prompted for account or reference, enter:{" "}
            <strong className="font-mono">{orderNumber || "—"}</strong>
          </li>
          <li>
            Complete the payment and wait for the M-Pesa confirmation SMS.
          </li>
        </ol>

        {MPESA_CONFIG.paybillNumber ? (
          <p className="mt-4 text-sm text-gray-600">
            <strong>Paybill option:</strong> Paybill{" "}
            {MPESA_CONFIG.paybillNumber}, account{" "}
            <span className="font-mono">{orderNumber}</span>.
          </p>
        ) : null}

        <p className="mt-4 rounded-lg bg-[#001F3F]/5 p-3 text-sm text-gray-700">
          <strong>Need help?</strong> Call{" "}
          <a
            href={`tel:${MPESA_CONFIG.supportPhone.replace(/\s/g, "")}`}
            className="text-[#0066CC] underline"
          >
            {MPESA_CONFIG.supportPhone}
          </a>
          . {MPESA_CONFIG.supportWhatsAppHint}
        </p>
      </section>

      {/* Order summary */}
      <section className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="font-semibold text-[#001F3F]">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {linesWithProducts.map(({ line, product }) => (
            <li key={`${line.productId}-${line.size ?? ""}`} className="flex justify-between gap-4">
              <span className="text-gray-700">
                {product.name}
                {line.size ? ` · ${line.size}` : ""} × {line.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatKes(product.priceKes * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-[#001F3F]">
          <span>Total</span>
          <span>{formatKes(subtotalKes)}</span>
        </div>
      </section>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-bold text-[#001F3F]">Your details</h2>

        {error ? (
          <p
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            required
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[#001F3F]"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Jane Wanjiku"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone (M-Pesa number)
          </label>
          <input
            required
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[#001F3F]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[#001F3F]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            M-Pesa confirmation code
          </label>
          <input
            required
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 font-mono uppercase text-[#001F3F]"
            value={mpesaCode}
            onChange={(e) => setMpesaCode(e.target.value)}
            placeholder="e.g. QGH1ABC2DE"
          />
          <p className="mt-1 text-xs text-gray-500">
            From your M-Pesa SMS after payment (transaction / confirmation
            code).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery / pickup notes{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[#001F3F]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Area, landmark, or ‘pickup at Marist’"
          />
        </div>

        <p className="text-xs text-gray-500">
          Payment integration (automated confirmation) can be added later. For
          now, our team matches your M-Pesa code and order number manually.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="flex-1 bg-[#0066CC] py-6 text-base font-semibold text-white hover:bg-blue-700"
          >
            Submit order
          </Button>
          <Link href="/merchandise/cart" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#001F3F] py-6 text-[#001F3F]"
            >
              Back to cart
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
