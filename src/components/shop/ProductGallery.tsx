"use client";

import { useState } from "react";
import { BraceletPlaceholder } from "@/components/icons";

export function ProductGallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[999px_999px_24px_24px] bg-blush">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.url} alt={current.alt} className="h-full w-full object-cover" />
        ) : (
          <BraceletPlaceholder className="h-[70%] w-[70%]" />
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex flex-wrap gap-3" role="group" aria-label={`${name} photos`}>
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={`h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 bg-blush p-0 ${
                i === active ? "border-plum" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
