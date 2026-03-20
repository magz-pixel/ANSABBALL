import Image from "next/image";
import { MerchandiseShop } from "@/components/merchandise/merchandise-shop";

export default function MerchandisePage() {
  return (
    <div className="bg-white">
      <section className="relative flex min-h-[38vh] items-center justify-center overflow-hidden bg-[#001F3F] px-4">
        <Image
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80"
          alt="Basketball shoes and gear — ANSA store"
          fill
          className="object-cover opacity-35"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#001F3F]/85" />
        <div className="relative z-10 max-w-3xl text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            ANSA Store
          </h1>
          <p className="mt-3 text-lg text-white/90 md:text-xl">
            Shoes, kits & gear — built for the court
          </p>
        </div>
      </section>
      <MerchandiseShop />
    </div>
  );
}
