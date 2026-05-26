# Sistema de Reservas

App de turnos médicos construida con Next.js, Prisma y PostgreSQL.

## Stack

- **Next.js 14** (App Router + Server Actions)
- **Prisma** (ORM)
- **PostgreSQL** (base de datos)
- **Tailwind CSS** (estilos)
- **GSAP** (animaciones)

## Setup inicial

### 1. Instalá las dependencias
```bash
npm install
```

### 2. Configurá las variables de entorno
```bash
cp .env.example .env
```
Editá `.env` y reemplazá `DATABASE_URL` con tu cadena de conexión.

**Opciones para la DB:**
- **Local:** `postgresql://postgres:password@localhost:5432/sistema_reservas`
- **Railway:** creá un proyecto en railway.app y copiá la URL
- **Neon:** creá una DB gratuita en neon.tech y copiá la URL

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
| `npm run db:push` | Sincroniza el schema con la DB |
| `npm run db:studio` | Abre Prisma Studio (GUI de la DB) |
| `npm run db:seed` | Carga datos de prueba |

## Estructura del proyecto

```
/actions
  turnos.ts         → crear, cancelar, buscar turnos
  profesionales.ts  → listar profesionales
/app
  /                 → landing con profesionales
  /reservar/[id]    → formulario de reserva
  /mis-turnos       → cancelar turnos por email
/lib
  prisma.ts         → cliente de Prisma (singleton)
/prisma
  schema.prisma     → modelos de la DB
  seed.ts           → datos de prueba
```
