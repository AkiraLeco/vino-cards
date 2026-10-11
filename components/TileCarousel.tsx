"use client";

import { useState } from "react";
import GameTile, { type GameTileData } from "./GameTile";

/**
 * Faixa de carrossel animada: os cards correm continuamente, em laço, e param ao passar o mouse,
 * focar um card ou apertar o botão de pausa. Cada card abre só por clique.
 * Com "reduzir movimento" vira uma faixa rolável.
 */
export default function TileCarousel({ tiles }: { tiles: GameTileData[] }) {
  const [paused, setPaused] = useState(false);
  // Repete a lista para o laço não ter emenda (as cópias ficam ocultas para leitores de tela).
  const loop = [...tiles, ...tiles, ...tiles, ...tiles];

  return (
    <div className="relative">
      <div
        data-paused={paused}
        className="tile-marquee -mx-1 overflow-hidden px-1 pb-6 pt-3 motion-reduce:overflow-x-auto"
      >
        <div className="tile-track flex w-max gap-4">
          {loop.map((t, i) => (
            <div key={i} className="w-[78vw] max-w-[360px] shrink-0 sm:w-[340px]">
              <GameTile {...t} hidden={i >= tiles.length} />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
        className="absolute -top-1 right-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black/60 shadow ring-1 ring-black/5 hover:text-violet-700 motion-reduce:hidden"
      >
        {paused ? "▶ Retomar" : "⏸ Pausar"}
      </button>
    </div>
  );
}
