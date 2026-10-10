import GameTile, { type GameTileData } from "./GameTile";

/**
 * Faixa de carrossel animada: os cards correm continuamente, em laço, e param ao passar o mouse
 * ou focar um card. Cada card abre só por clique. Com "reduzir movimento" vira uma faixa rolável.
 */
export default function TileCarousel({ tiles }: { tiles: GameTileData[] }) {
  // Repete a lista para o laço não ter emenda (a 2ª cópia fica oculta para leitores de tela).
  const loop = [...tiles, ...tiles, ...tiles, ...tiles];

  return (
    <div className="tile-marquee -mx-1 overflow-hidden px-1 pb-6 pt-3 motion-reduce:overflow-x-auto">
      <div className="tile-track flex w-max gap-4">
        {loop.map((t, i) => (
          <div key={i} className="w-[78vw] max-w-[360px] shrink-0 sm:w-[340px]">
            <GameTile {...t} hidden={i >= tiles.length} />
          </div>
        ))}
      </div>
    </div>
  );
}
