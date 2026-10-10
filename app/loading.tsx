export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px]" aria-busy="true" aria-label="Carregando">
      <div className="mb-5 h-8 w-64 animate-pulse rounded-lg bg-black/10" />
      <div className="h-16 animate-pulse rounded-2xl bg-black/5" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="aspect-[5/7] animate-pulse bg-black/5" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/2 animate-pulse rounded bg-black/10" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-black/10" />
              <div className="h-5 w-1/3 animate-pulse rounded bg-black/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
