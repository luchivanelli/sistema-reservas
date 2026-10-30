# MedCare — Sistema de Reservas

App de turnos médicos construida con Next.js (App Router + Server Actions), Prisma y PostgreSQL.

## Stack

- **Next.js 16** (App Router, Server Actions, `next/font`)
- **React 19**
- **Prisma 6** + **PostgreSQL**
- **Tailwind CSS 4** (tokens de diseño en `app/globals.css` vía `@theme`)
- **lucide-react** (íconos)

## Funcionalidades

- **Inicio**: búsqueda directa, especialidades con cantidad de profesionales, destacados y “cómo funciona”.
- **Buscar médicos** (`/buscar`): filtrado instantáneo en el cliente por texto (sin importar tildes), especialidad y clínica. La URL se mantiene compartible (`?busqueda=&especialidad=&clinica=`).
- **Búsqueda rápida** (`Ctrl/⌘ + K` o el botón “Buscar…” del navbar): paleta de comandos para saltar a un profesional, una especialidad o a “Mis turnos” con el teclado.
- **Reservar** (`/reservar/[id]`): calendario con disponibilidad real por día (punto verde = horarios libres, día tachado = completo), horarios agrupados en mañana/tarde, resumen fijo y barra inferior en mobile. Los datos del paciente se recuerdan para la próxima reserva.
- **Confirmación** (`/reservar/[id]/exito?turno=`): detalle del turno leído desde la base, link para agregarlo a Google Calendar y acceso directo a “Mis turnos”.
- **Mis turnos** (`/mis-turnos`): búsqueda por email (se recuerda el último usado), próximos turnos con cancelación en dos pasos y historial de turnos pasados o cancelados.

## Setup inicial

### 1. Instalá las dependencias
```bash
npm install
```

### 2. Configurá las variables de entorno
Creá un archivo `.env` con tu cadena de conexión:
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_reservas"
```

Opciones para la DB: PostgreSQL local, [Railway](https://railway.app) o [Neon](https://neon.tech).

### 3. Creá las tablas en la DB
```bash
npm run db:push
```

### 4. Cargá datos de prueba (opcional)
```bash
npm run db:seed
```

### 5. Levantá el servidor
```bash
npm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincroniza el schema con la DB |
| `npm run db:studio` | Abre Prisma Studio (GUI de la DB) |
| `npm run db:seed` | Carga datos de prueba |

## Estructura del proyecto

```
/actions
  profesionales.ts       → listar, buscar, destacados, resumen
  turnos.ts              → crear, cancelar, ocupados por rango, buscar por email
/app
  layout.tsx             → fuentes, Navbar, Footer y toasts globales
  page.tsx               → inicio
  loading.tsx / error.tsx / not-found.tsx
  /buscar                → listado con filtros instantáneos (BuscarCliente)
  /reservar/[id]         → calendario + datos del paciente (CalendarioReserva)
  /reservar/[id]/exito   → confirmación del turno
  /mis-turnos            → consulta y cancelación por email (MisTurnosCliente)
/components
  Navbar.tsx             → navegación con link activo y atajo Ctrl+K
  CommandPalette.tsx     → búsqueda rápida
  ProfesionalCard.tsx    → tarjeta reutilizable de profesional
  Avatar.tsx             → iniciales con color por especialidad
  HeroSearch.tsx         → buscador del inicio
  /ui/Toast.tsx          → notificaciones
/lib
  prisma.ts              → cliente de Prisma (singleton)
  fechas.ts              → slots, formateo de fechas, link a Google Calendar
  especialidades.ts      → ícono, color y descripción por especialidad
  texto.ts               → normalización de texto, validación de email
/prisma
  schema.prisma          → modelos de la DB
  seed.ts                → datos de prueba
```

## Notas de diseño

- Los colores, sombras y animaciones viven en `app/globals.css` como tokens de Tailwind (`@theme`), con clases de componente (`.btn`, `.card`, `.input`, `.slot`, `.cal-day`, etc.).
- Cada especialidad tiene un “tono” (`.tone-*`) que colorea avatares, pills e íconos de forma consistente en toda la app.
- Navbar y Footer se renderizan una sola vez en el layout raíz, así persisten entre navegaciones. Cada ruta tiene su `loading.tsx` con skeletons para que la transición sea inmediata.
