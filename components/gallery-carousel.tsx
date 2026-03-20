"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const GALLERY = [
  {
    src: "/gallery/gallery-1.png",
    alt: "ANSA Basketball players in action on an outdoor court",
    caption: "On the court",
  },
  {
    src: "/gallery/gallery-2.png",
    alt: "ANSA Basketball coach with young players wearing medals",
    caption: "Our community",
  },
  {
    src: "/gallery/gallery-3.png",
    alt: "Athlete receiving a medal at an outdoor ceremony",
    caption: "Recognition & pride",
  },
  {
    src: "/gallery/gallery-4.png",
    alt: "Large ANSA squad with medals and trophies after competition",
    caption: "One team",
  },
];

export function GalleryCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % GALLERY.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#001F3F] py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          Our Moments
        </h2>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-2xl md:aspect-[21/9]">
          {GALLERY.map((item, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                i === index ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={i === 0}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                <p className="text-lg font-semibold text-white md:text-xl">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {GALLERY.map((_, i) => (
            <button
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === index
                  ? "w-8 bg-[#0066CC]"
                  : "w-2 bg-white/40 hover:bg-white/60"
              )}
              onClick={() => setIndex(i)}
              aria-label={`View slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
