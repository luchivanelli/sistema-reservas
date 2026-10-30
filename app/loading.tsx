export default function Loading() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-label="Cargando">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-5 h-12 w-3/4 max-w-xl" />
      <div className="skeleton mt-3 h-12 w-1/2 max-w-md" />
      <div className="skeleton mt-6 h-5 w-2/3 max-w-lg" />
      <div className="skeleton mt-8 h-14 w-full max-w-xl rounded-2xl" />
      <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-[68px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
