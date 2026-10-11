import Image from "next/image";

// Hosts liberados em next.config.ts. Qualquer outro endereço (ou SVG) é exibido sem otimização,
// para a imagem nunca quebrar.
const OPTIMIZED_HOSTS = ["images.pokemontcg.io", process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : ""];

function canOptimize(src: string) {
  try {
    return OPTIMIZED_HOSTS.includes(new URL(src).hostname) && !src.endsWith(".svg");
  } catch {
    return false;
  }
}

/** Imagem preenchendo o pai (que precisa ser `relative` e ter tamanho). `sizes` evita baixar foto maior que o necessário. */
export default function CardImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!canOptimize(src)}
      className={className}
    />
  );
}
