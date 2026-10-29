import Link from "next/link";

export type GameTileData = {
  href: string;
  title: string;
  sub: string;
  icon: string;
  /** Fundo do card (linear-gradient). Com `image` de arte cheia, use cores RGBA para a imagem aparecer por baixo. */
  background: string;
  /** Escurecimento extra de uma extremidade (opcional, RGBA). */
  shade?: string;
  image?: string;
  imagePosition?: string;
  /** Imagem recortada (WebP transparente): aparece inteira sobre o degradê. */
  cutout?: boolean;
};

export default function GameTile({
  hidden = false,
  href,
  title,
  sub,
  icon,
  background,
  shade,
  image,
  imagePosition = "center",
  cutout = false,
}: GameTileData & { hidden?: boolean }) {
  const art = image && !cutout;

  return (
    <Link
      href={href}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="group relative flex h-full w-full min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-[0_8px_24px_-10px_rgba(23,27,53,0.45)] ring-1 ring-gold/30 transition duration-300 hover:-translate-y-1 hover:ring-gold/80 hover:shadow-[0_18px_34px_-10px_rgba(23,27,53,0.6)]"
      style={{ background: art ? undefined : background }}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          style={{ objectPosition: imagePosition }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}
      {art && <div className="pointer-events-none absolute inset-0" style={{ background }} />}
      {shade && <div className="pointer-events-none absolute inset-0" style={{ background: shade }} />}

      {image && cutout ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="pointer-events-none absolute right-0 top-0 bottom-2 w-[38%] object-contain object-right-bottom p-2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] transition duration-200 group-hover:scale-105"
        />
      ) : (
        !image && (
          <span className="pointer-events-none absolute -right-2 -top-3 text-7xl opacity-25 transition duration-200 group-hover:scale-110">
            {icon}
          </span>
        )
      )}

      <div className="relative">
        <h2 className="font-display text-3xl font-bold tracking-wide [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">{title}</h2>
        <p
          className={`mt-1 text-sm text-white/95 [text-shadow:0_1px_4px_rgba(0,0,0,0.35)] ${
            image ? "max-w-[70%]" : ""
          }`}
        >
          {sub}
        </p>
      </div>

      <span className="relative mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em]">
        Explorar
        <span className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
      </span>
    </Link>
  );
}
