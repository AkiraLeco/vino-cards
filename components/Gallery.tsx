"use client";

import { useState } from "react";
import CardImage from "./CardImage";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const current = images[i] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border border-black/5 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm sm:p-8">
        <div className="relative mx-auto aspect-[5/7] w-full max-w-[480px]">
          <CardImage
            src={current}
            alt={alt}
            priority
            sizes="(min-width:1024px) 480px, 90vw"
            className="rounded-lg object-contain drop-shadow-xl"
          />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((u, idx) => (
            <button
              key={u}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ver foto ${idx + 1}`}
              className={`overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                idx === i ? "border-violet-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <div className="relative h-20 w-14">
                <CardImage src={u} alt="" sizes="56px" className="object-contain" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
