'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { Calendar, Clock, MapPin, Shield, Eye, EyeOff, Star, ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// TODO: reemplazar con datos reales via Server Action
const MOCK_PROF = {
  nombre: 'Dr. Alexander Bennett',
  especialidad: 'Cardiología',
  clinica: 'Central Medical Plaza, Room 402',
  rating: 4.9,
  reviews: 120,
};

export default function ConfirmarPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { profesionalId } = useParams();
  const params = useSearchParams();
  const router = useRouter();

  const fecha = params.get('fecha') || 'Lunes, 24 de Octubre, 2024';
  const hora = params.get('hora') || '09:30 AM';

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.anim-in', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' });
    }, ref);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async () => {
    if (!nombre || !email) return;
    setLoading(true);
    // TODO: llamar Server Action crearTurno() acá
    // await crearTurno({ profesionalId, fecha, hora, clienteNombre: nombre, clienteEmail: email });
    await new Promise(r => setTimeout(r, 800)); // simulación
    router.push(`/reservar/${profesionalId}/exito?nombre=${encodeURIComponent(nombre)}&fecha=${encodeURIComponent(fecha)}&hora=${encodeURIComponent(hora)}`);
  };

  return (
    <div ref={ref}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <Link href={`/reservar/${profesionalId}`} className="flex items-center gap-1.5 text-sm text-[var(--gray-400)] hover:text-[var(--navy)] mb-8 transition-colors">
          <ChevronLeft size={14} />
          Volver al calendario
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* LEFT — Form */}
          <div className="anim-in">
            <div className="card-lg p-8">
              <h1 className="font-display text-3xl font-bold text-[var(--navy)] mb-2">Finalizá tu reserva</h1>
              <p className="text-sm text-[var(--gray-500)] mb-8">Completá tus datos para confirmar el turno médico.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5">Nombre completo</label>
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="input"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5">Email</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    className="input"
                    placeholder="juan@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="input pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--gray-700)]"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--gray-400)] mt-1.5">Mínimo 8 caracteres con letras y números.</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!nombre || !email || loading}
                  className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>

                <p className="text-xs text-center text-[var(--gray-400)]">
                  Al confirmar, aceptás nuestros{' '}
                  <Link href="#" className="text-[var(--blue)] hover:underline">Términos de Servicio</Link>{' '}
                  y{' '}
                  <Link href="#" className="text-[var(--blue)] hover:underline">Política de Privacidad</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Summary */}
          <div className="anim-in space-y-4">
            <div className="card-lg p-6">
              <h2 className="font-display text-lg font-bold text-[var(--navy)] mb-4">Resumen del turno</h2>

              {/* Doctor card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--gray-50)] border border-[var(--gray-100)] mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blue-light)] to-[var(--blue-mid)] flex items-center justify-center text-xl shrink-0">
                  👨‍⚕️
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--navy)]">{MOCK_PROF.nombre}</p>
                  <p className="text-xs text-[var(--gray-400)]">{MOCK_PROF.especialidad}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-[var(--gray-500)]">{MOCK_PROF.rating} ({MOCK_PROF.reviews} reseñas)</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {[
                  { icon: Calendar, label: 'Fecha', value: fecha },
                  { icon: Clock, label: 'Hora', value: hora },
                  { icon: MapPin, label: 'Ubicación', value: MOCK_PROF.clinica },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--blue-light)] flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-[var(--blue)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--gray-400)] font-medium">{label}</p>
                      <p className="text-sm font-semibold text-[var(--navy)]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--gray-100)] my-5" />

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--gray-500)]">
                  <span>Consulta médica</span>
                  <span>$120.00</span>
                </div>
                <div className="flex justify-between text-[var(--gray-500)]">
                  <span>Impuesto de servicio</span>
                  <span>$12.00</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--navy)] pt-2 border-t border-[var(--gray-100)]">
                  <span>Total</span>
                  <span className="text-[var(--blue)]">$132.00</span>
                </div>
              </div>
            </div>

            {/* Secure badge */}
            <div className="card p-4 flex items-center justify-center gap-2">
              <Shield size={15} className="text-[var(--cyan)]" />
              <span className="text-sm font-medium text-[var(--gray-500)]">Entorno de reserva seguro</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
