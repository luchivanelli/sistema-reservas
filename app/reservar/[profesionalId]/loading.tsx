export default function Loading() {
  return (
    <div className="container-x py-6 sm:py-10" aria-busy="true" aria-label="Cargando disponibilidad">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="skeleton h-7 w-32" />
            <div className="skeleton h-7 w-48" />
          </div>
          <div className="panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-9 w-44" />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="skeleton mx-auto h-10 w-10 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="panel p-6">
            <div className="skeleton h-5 w-64" />
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="panel p-6">
            <div className="flex items-center gap-3">
              <div className="skeleton h-16 w-16 rounded-3xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-24 rounded-full" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
