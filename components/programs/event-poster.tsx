"use client";

import Image from "next/image";
import { useState } from "react";

export function EventPoster({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[3/4] w-full max-w-md items-center justify-center rounded-xl border border-dashed border-[#001F3F]/25 bg-[#001F3F]/5 px-6 text-center text-sm text-black/60">
        Add poster image at <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">public/posters/april-basketball-training.png</code>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-gray-200 shadow-lg">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1067}
        className="h-auto w-full object-cover"
        sizes="(max-width: 768px) 100vw, 28rem"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
