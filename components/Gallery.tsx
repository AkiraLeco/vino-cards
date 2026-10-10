"use client";

import { useState } from "react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const current = images[i] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-3xl border border-black/5 bg-gradient-to-b from-violet-50 to-white p-4 shadow-sm sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain drop-shadow-xl"
        />
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-20 w-14 object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
