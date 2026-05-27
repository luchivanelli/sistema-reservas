export default function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-white border-t border-white/10 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between md:items-center">
        <p className="font-display text-lg font-semibold mb-1">MedCare</p>
        <p className="text-sm text-white/60">© 2026 MedCare Systems. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
