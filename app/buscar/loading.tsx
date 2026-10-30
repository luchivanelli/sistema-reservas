export default function Loading() {
  return (
    <div className="container-x py-8 sm:py-10" aria-busy="true" aria-label="Cargando profesionales">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton mt-3 h-4 w-96 max-w-full" />
      <div className="skeleton mt-6 h-12 w-full rounded-2xl" />

      <div className="mt-8 flex gap-8">
        <div className="hidden w-64 shrink-0 space-y-2 lg:block">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <div className="skeleton mb-5 h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex gap-3.5">
                  <div className="skeleton h-12 w-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-20 rounded-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
                <div className="skeleton mt-5 h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
