# ClipBooking — Documentación Técnica Completa

> SaaS de gestión para barberías. Agendamiento público + panel interno con caja y cuadratura.
> Objetivo: venderse como suscripción mensual a múltiples barberías.

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Base de datos — Entidades](#4-base-de-datos--entidades)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Roles y permisos](#6-roles-y-permisos)
7. [API REST — Endpoints](#7-api-rest--endpoints)
8. [Lógica de disponibilidad](#8-lógica-de-disponibilidad)
9. [Notificaciones (WhatsApp + Email)](#9-notificaciones-whatsapp--email)
10. [Frontend — Flujo de agendamiento](#10-frontend--flujo-de-agendamiento)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Servicios externos configurados](#12-servicios-externos-configurados)
13. [Instalación y desarrollo local](#13-instalación-y-desarrollo-local)
14. [Deploy en Railway](#14-deploy-en-railway)
15. [Datos de prueba (seed)](#15-datos-de-prueba-seed)
16. [Roadmap y pendientes](#16-roadmap-y-pendientes)

---

## 1. Arquitectura general

```
Internet
   │
   ├── Cliente (browser/móvil)
   │     └── http://localhost:3001  →  Next.js 16 (frontend)
   │                                       │
   │                                       ├── Server Components → fetch cacheado (servicios, barberos)
   │                                       └── Client Components → wizard interactivo
   │
   └── Panel interno (browser)
         └── /admin  (pendiente)
               └── Requiere JWT
   
Frontend (Next.js) ──── fetch ────► Backend (NestJS) ──── TypeORM ────► PostgreSQL (Railway)
                                          │
                                          ├── Twilio API  →  WhatsApp al cliente
                                          └── Resend API  →  Email al cliente
```

**Puertos en desarrollo:**
- Backend NestJS: `http://localhost:3000`
- Frontend Next.js: `http://localhost:3001`
- PostgreSQL: Railway cloud (no local)

**Acceso desde red local (celular mismo WiFi):**
- Frontend: `http://192.168.1.108:3001`
- Backend: `http://192.168.1.108:3000`

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Backend | NestJS | 11.x | Framework Node.js modular |
| ORM | TypeORM | 0.3.x | Entidades, repositorios, migrations |
| Base de datos | PostgreSQL | 16 | Railway cloud |
| Auth | JWT + Passport | — | passport-jwt strategy |
| Validación | class-validator | — | DTOs con decoradores |
| Frontend | Next.js | 16.2.9 | App Router + Turbopack |
| UI | React | 19.x | Server + Client Components |
| Estilos | Tailwind CSS | 4.x | Sin CSS modules |
| WhatsApp | Twilio | — | Sandbox gratuito en dev |
| Email | Resend | — | 3.000 emails/mes gratis |
| Deploy | Railway | — | Backend + PostgreSQL |
| Runtime | Node.js | 22.x | |
| Package manager | npm | 11.x | |

---

## 3. Estructura de carpetas

```
clipbooking/
├── DOCS.md                          ← este archivo
├── PROYECTO.md                      ← registro de avance
│
├── backend/
│   ├── src/
│   │   ├── app.module.ts            ← módulo raíz, registra todos los módulos
│   │   ├── main.ts                  ← bootstrap: ValidationPipe, CORS, puerto
│   │   ├── seed.ts                  ← script de datos iniciales (solo dev)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts      ← valida credenciales, emite JWT
│   │   │   ├── auth.controller.ts   ← POST /auth/login
│   │   │   ├── jwt.strategy.ts      ← extrae payload del token
│   │   │   ├── decorators/
│   │   │   │   └── roles.decorator.ts   ← @Roles(Rol.DUENO)
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts    ← verifica token JWT
│   │   │       └── roles.guard.ts       ← verifica rol del usuario
│   │   │
│   │   ├── barberos/
│   │   │   ├── barberos.module.ts
│   │   │   ├── barberos.service.ts  ← CRUD + findActivos()
│   │   │   ├── barberos.controller.ts
│   │   │   ├── entities/barbero.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-barbero.dto.ts
│   │   │       └── update-barbero.dto.ts
│   │   │
│   │   ├── servicios/               ← misma estructura que barberos
│   │   ├── clientes/                ← findOrCreate() por teléfono
│   │   │
│   │   ├── citas/
│   │   │   ├── citas.module.ts
│   │   │   ├── citas.service.ts     ← findAll (filtrado por rol), completar, cancelar
│   │   │   ├── citas.controller.ts
│   │   │   ├── disponibilidad.service.ts  ← genera slots libres
│   │   │   ├── entities/cita.entity.ts
│   │   │   └── dto/completar-cita.dto.ts
│   │   │
│   │   ├── usuarios/
│   │   │   ├── usuarios.module.ts
│   │   │   ├── usuarios.service.ts  ← CRUD, bcrypt en create/update
│   │   │   ├── usuarios.controller.ts
│   │   │   ├── entities/usuario.entity.ts   ← enum Rol
│   │   │   └── dto/
│   │   │
│   │   ├── public/                  ← endpoints sin JWT
│   │   │   ├── public.module.ts
│   │   │   ├── public.service.ts    ← orquesta agendamiento + dispara notificaciones
│   │   │   ├── public.controller.ts
│   │   │   └── dto/crear-cita-publica.dto.ts
│   │   │
│   │   ├── caja/
│   │   │   ├── caja.module.ts
│   │   │   ├── caja.service.ts      ← cuadratura: total, por barbero, por método pago
│   │   │   └── caja.controller.ts
│   │   │
│   │   └── notificaciones/
│   │       ├── notificaciones.module.ts
│   │       └── notificaciones.service.ts  ← WhatsApp (Twilio) + Email (Resend)
│   │
│   ├── .env                         ← variables locales (NO commitear)
│   ├── .env.example                 ← plantilla de variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx            ← RootLayout, fuente Geist, lang="es"
    │   │   ├── globals.css           ← Tailwind + touch-action fix mobile
    │   │   ├── page.tsx              ← redirect → /agendar
    │   │   └── agendar/
    │   │       └── page.tsx          ← Server Component, carga servicios+barberos cacheados
    │   │
    │   ├── components/
    │   │   └── agendamiento/
    │   │       ├── AgendamientoWizard.tsx   ← 'use client', orquesta los 5 pasos
    │   │       ├── StepServicio.tsx         ← cards de servicios
    │   │       ├── StepBarbero.tsx          ← cards de barberos
    │   │       ├── StepFecha.tsx            ← calendario sin dependencias
    │   │       ├── StepHorario.tsx          ← grilla de slots dinámicos
    │   │       ├── StepDatos.tsx            ← form nombre/teléfono/email/notas
    │   │       └── StepConfirmacion.tsx     ← resumen de cita confirmada
    │   │
    │   └── lib/
    │       ├── api.ts               ← helpers fetch al backend
    │       ├── types.ts             ← interfaces TypeScript compartidas
    │       └── cached-data.ts       ← getServicios() + getBarberos() con 'use cache'
    │
    ├── .env.local                   ← NEXT_PUBLIC_API_URL (NO commitear)
    ├── next.config.ts               ← cacheComponents: true, allowedDevOrigins
    └── package.json
```

---

## 4. Base de datos — Entidades

### `barberos`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | generado automáticamente |
| `nombre` | VARCHAR | nombre completo |
| `telefono` | VARCHAR NULL | teléfono de contacto |
| `activo` | BOOLEAN | false = eliminado lógico |
| `created_at` | TIMESTAMP | fecha de creación |

### `servicios`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `nombre` | VARCHAR | ej: "Corte + barba" |
| `duracion_min` | INTEGER | duración en minutos (20, 30, 45, 60…) |
| `precio` | DECIMAL(10,2) | precio en CLP |
| `activo` | BOOLEAN | false = eliminado lógico |

### `clientes`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `nombre` | VARCHAR | nombre del cliente |
| `telefono` | VARCHAR | identificador único en la práctica |
| `email` | VARCHAR NULL | para envío de confirmación |
| `created_at` | TIMESTAMP | |

> El cliente se crea con `findOrCreate()` por teléfono — si ya existe ese número, reutiliza el registro.

### `citas`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `barbero_id` | UUID FK → barberos | |
| `servicio_id` | UUID FK → servicios | |
| `cliente_id` | UUID FK → clientes | |
| `fecha` | DATE | formato YYYY-MM-DD |
| `hora_inicio` | TIME | ej: "14:30" |
| `hora_fin` | TIME | calculado: hora_inicio + duracion_min |
| `estado` | ENUM | `pendiente` \| `completada` \| `cancelada` |
| `metodo_pago` | ENUM NULL | `efectivo` \| `debito` \| `transferencia` |
| `monto` | DECIMAL(10,2) | **copiado del servicio al momento de crear** |
| `notas` | TEXT NULL | observaciones opcionales |
| `cancelacion_token` | UUID NULL | token único para cancelación por cliente |
| `created_at` | TIMESTAMP | |

> **Importante:** `monto` se copia del servicio al crear la cita. Si el precio del servicio cambia después, las citas antiguas conservan el precio original.

### `usuarios`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID PK | |
| `nombre` | VARCHAR | |
| `email` | VARCHAR UNIQUE | credencial de login |
| `password` | VARCHAR | hash bcrypt (10 rounds) |
| `rol` | ENUM | `dueno` \| `barbero` \| `recepcion` |
| `barbero_id` | UUID NULL | FK → barberos (solo si rol = barbero) |
| `activo` | BOOLEAN | false = acceso bloqueado |
| `created_at` | TIMESTAMP | |

---

## 5. Reglas de negocio

| Regla | Detalle |
|---|---|
| **Horario fijo** | 10:00 a 20:45, todos los días |
| **Slots** | Se generan dinámicamente según la duración del servicio seleccionado |
| **Sin solapamiento** | Un barbero no puede tener dos citas cuyas horas se crucen |
| **Precio congelado** | La cita copia el precio del servicio al momento de crearse |
| **Estados de cita** | `pendiente` → `completada` o `cancelada`. No se puede completar una cancelada ni cancelar una completada |
| **Barbero no cancela** | Solo `dueno` y `recepcion` pueden cancelar citas |
| **Pago al completar** | El método de pago se registra al marcar la cita como completada |
| **Cliente sin login** | El agendamiento público no requiere cuenta ni autenticación |
| **findOrCreate cliente** | Si un cliente agenda con el mismo teléfono dos veces, se reutiliza su registro |

---

## 6. Roles y permisos

| Acción | `dueno` | `barbero` | `recepcion` |
|---|---|---|---|
| Ver todas las citas | ✅ | ❌ (solo las suyas) | ✅ |
| Completar cita + pago | ✅ | ✅ (solo las suyas) | ✅ |
| Cancelar cita | ✅ | ❌ | ✅ |
| Ver cuadratura/caja | ✅ | ❌ | ✅ |
| CRUD barberos | ✅ | ❌ | ❌ |
| CRUD servicios | ✅ | ❌ | ❌ |
| CRUD usuarios | ✅ | ❌ | ❌ |
| Configuración general | ✅ | ❌ | ❌ |

---

## 7. API REST — Endpoints

### Públicos (sin JWT)

```
GET  /public/barberos
     → Lista barberos activos
     → Response: [{ id, nombre, telefono, activo }]

GET  /public/servicios
     → Lista servicios activos
     → Response: [{ id, nombre, duracion_min, precio, activo }]

GET  /public/disponibilidad?barbero_id=&fecha=&servicio_id=
     → Slots libres para ese barbero ese día
     → fecha formato: YYYY-MM-DD
     → Response: { slots: ["10:00", "10:30", ...], duracion_min: 30 }

POST /public/citas
     → Crear cita (agendamiento público)
     → Body: {
         barbero_id: string (UUID),
         servicio_id: string (UUID),
         fecha: string (YYYY-MM-DD),
         hora_inicio: string (HH:MM),
         nombre_cliente: string,
         telefono_cliente: string,
         email_cliente?: string,
         notas?: string
       }
     → Response: cita completa con relaciones
     → Efecto: envía WhatsApp + Email de confirmación
```

### Autenticación

```
POST /auth/login
     → Body: { email, password }
     → Response: { access_token: string, usuario: { id, nombre, email, rol, barbero_id } }
```

> Todos los endpoints siguientes requieren header: `Authorization: Bearer <token>`

### Citas (panel interno)

```
GET  /citas
     → dueno/recepcion: todas las citas
     → barbero: solo sus citas
     → Response: [cita con barbero, servicio, cliente]

GET  /citas/hoy
     → Citas del día actual (misma lógica de filtro por rol)

PUT  /citas/:id/completar
     → Body: { metodo_pago: "efectivo"|"debito"|"transferencia", notas?: string }
     → Solo citas en estado "pendiente"
     → Barbero solo puede completar las suyas

PUT  /citas/:id/cancelar
     → No requiere body
     → Solo dueno y recepcion pueden cancelar
```

### Caja

```
GET  /caja/cuadratura?fecha=YYYY-MM-DD
     → Solo dueno y recepcion
     → Si no se envía fecha, usa hoy
     → Response: {
         fecha,
         total,
         cantidad_citas,
         por_barbero: [{ nombre, total, cantidad }],
         por_metodo_pago: { efectivo, debito, transferencia },
         citas: [...]
       }
```

### Configuración (solo `dueno`)

```
GET    /barberos          → lista todos (incluyendo inactivos)
POST   /barberos          → crear barbero
PUT    /barberos/:id      → actualizar barbero
DELETE /barberos/:id      → desactivar barbero (soft delete)

GET    /servicios         → lista todos
POST   /servicios         → crear servicio
PUT    /servicios/:id     → actualizar servicio
DELETE /servicios/:id     → desactivar servicio (soft delete)

GET    /usuarios          → lista todos (sin password)
POST   /usuarios          → crear usuario (hashea password automáticamente)
PUT    /usuarios/:id      → actualizar usuario
DELETE /usuarios/:id      → desactivar usuario (soft delete)
```

---

## 8. Lógica de disponibilidad

**Archivo:** `backend/src/citas/disponibilidad.service.ts`

```
Entrada: barbero_id, fecha (YYYY-MM-DD), duracion_min (entero)

1. Consultar citas del barbero en esa fecha con estado = "pendiente"
2. Convertir hora_inicio y hora_fin de cada cita a minutos
3. Generar todos los slots posibles:
   - Desde: 10:00 (= 600 min)
   - Hasta: 20:45 (= 1245 min)
   - Paso: duracion_min
   - Condición: slot_inicio + duracion_min ≤ 1245
4. Filtrar slots que se solapan con citas existentes:
   - Un slot se solapa si: slot_inicio < cita_fin AND slot_fin > cita_inicio
5. Retornar slots libres como strings "HH:MM"

Ejemplo (servicio 30 min, sin citas):
→ ["10:00", "10:30", "11:00", ..., "20:00", "20:15"]
```

---

## 9. Notificaciones (WhatsApp + Email)

**Archivo:** `backend/src/notificaciones/notificaciones.service.ts`

### Cuándo se disparan
Al crear una cita vía `POST /public/citas`. Las notificaciones se envían **en background** (no bloquean la respuesta al cliente):

```typescript
// En public.service.ts — no se usa await, no bloquea
this.notificacionesService.enviarConfirmacion({ ... })
```

### Comportamiento si falla
- Se usa `Promise.allSettled()` — si WhatsApp falla, el email igual se envía
- Los errores se loguean pero **nunca rompen la creación de la cita**
- Si las variables de entorno no están configuradas, el servicio omite la notificación con un warning en logs

### WhatsApp (Twilio)
- **Desarrollo:** Sandbox gratuito. El número del cliente debe haber enviado `join <código>` al número del sandbox
- **Producción:** Requiere número WhatsApp Business aprobado por Meta
- Formato del número destino: `whatsapp:+56912345678`
- El mensaje incluye: nombre, fecha, hora, servicio, barbero y precio

### Email (Resend)
- **Desarrollo:** Usa `onboarding@resend.dev` como remitente (no requiere dominio verificado)
- **Producción:** Configurar dominio propio verificado en Resend
- Solo se envía si el cliente proporcionó email
- Plantilla HTML responsiva con tabla de resumen

---

## 10. Frontend — Flujo de agendamiento

**URL:** `/agendar` (también `/` redirige aquí)

### Arquitectura del componente

```
AgendarPage (Server Component)
  → getServicios()   ← cacheado con 'use cache' + cacheLife('days')
  → getBarberos()    ← cacheado con 'use cache' + cacheLife('days')
  → <AgendamientoWizard servicios={...} barberos={...} />

AgendamientoWizard (Client Component — 'use client')
  → Maneja estado del wizard con useState
  → 5 pasos + pantalla de confirmación
```

### Pasos del wizard

| Paso | Componente | Datos | API call |
|---|---|---|---|
| 1 - Servicio | `StepServicio` | props del server | ninguna |
| 2 - Barbero | `StepBarbero` | props del server | ninguna |
| 3 - Fecha | `StepFecha` | calendario local | ninguna |
| 4 - Horario | `StepHorario` | dinámico | `GET /public/disponibilidad` |
| 5 - Datos | `StepDatos` | formulario | ninguna |
| ✓ Confirmación | `StepConfirmacion` | resultado | `POST /public/citas` |

### Cache de datos estáticos (Next.js 16)
Servicios y barberos se cachean al primer request y se sirven desde el static shell:
```typescript
// lib/cached-data.ts
export async function getServicios(): Promise<Servicio[]> {
  'use cache'
  cacheLife('days')
  cacheTag('servicios')
  // ...
}
```
Para invalidar el caché cuando el admin modifica servicios/barberos → usar `revalidateTag('servicios')`.

### Comportamiento mobile
- `touch-action: manipulation` global → elimina delay de 300ms en iOS/Android
- `-webkit-tap-highlight-color: transparent` → sin highlight azul al tocar
- Diseño responsive con Tailwind (max-w-lg centrado)

---

## 11. Variables de entorno

### Backend (`backend/.env`)

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/dbname

# JWT
JWT_SECRET=string-secreto-largo
JWT_EXPIRES_IN=7d

# Servidor
PORT=3000
FRONTEND_URL=http://localhost:3001   # en producción: URL real del frontend

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   # sandbox dev / número real en prod

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM=ClipBooking <onboarding@resend.dev>   # en prod: tu dominio verificado
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# En producción: URL pública del backend en Railway
# En desarrollo por IP (celular mismo WiFi): http://192.168.1.108:3000
```

---

## 12. Servicios externos configurados

### PostgreSQL — Railway
- **Host público:** `thomas.proxy.rlwy.net:50995`
- **Host interno:** `postgres.railway.internal:5432` (solo desde Railway)
- **DB:** `railway`
- **Uso:** producción y desarrollo (misma BD por ahora)

> Para producción se recomienda separar: una BD de dev y otra de prod.

### Twilio — WhatsApp Sandbox
- **Account SID:** `AC6cd2df28ed0af6f62177154cf8d52dea`
- **Sandbox number:** `whatsapp:+14155238886`
- **Join code:** `join QYPNY4VL4UBZ424PP8K9AWKL`
- **Límite sandbox:** el número del cliente debe haber enviado el join code previamente
- **Caducidad del sandbox:** 72 horas por número (se puede renovar enviando el join code de nuevo)

### Resend — Email
- **Plan:** gratuito (3.000 emails/mes, 100/día)
- **Remitente dev:** `onboarding@resend.dev`
- **Para producción:** verificar dominio propio en resend.com y actualizar `RESEND_FROM`

---

## 13. Instalación y desarrollo local

### Prerequisitos
- Node.js 22+
- npm 11+
- Acceso a la BD PostgreSQL de Railway (o instalar PostgreSQL local)

### Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/clipbooking.git
cd clipbooking

# Backend
cd backend
cp .env.example .env
# Editar .env con las credenciales reales
npm install
npm run start:dev

# Frontend (nueva terminal)
cd ../frontend
cp .env.local.example .env.local   # o crear manualmente
npm install
npm run dev -- --port 3001
```

### Cargar datos de prueba

```bash
cd backend
npx ts-node -r tsconfig-paths/register src/seed.ts
```

Esto crea:
- 4 servicios (Corte de cabello, Corte + barba, Barba completa, Corte niño)
- 3 barberos (Carlos Pérez, Diego Ramírez, Matías Torres)
- 1 usuario admin: `admin@clipbooking.cl` / `admin123`

### URLs en desarrollo
- Agendamiento público: `http://localhost:3001`
- API backend: `http://localhost:3000`
- Desde celular (mismo WiFi): `http://192.168.1.108:3001`

---

## 14. Deploy en Railway

### Estructura en Railway
```
Proyecto Railway: clipbooking
├── Servicio: PostgreSQL  ← ya creado
├── Servicio: backend     ← por crear
└── Servicio: frontend    ← por crear (o usar Vercel)
```

### Pasos para deployar el backend

1. En Railway → New Service → GitHub Repo → seleccionar `clipbooking` → carpeta `backend`
2. Configurar variables de entorno en Railway (las mismas del `.env` pero con valores de producción):
   - `DATABASE_URL` → usar la URL **interna**: `postgresql://postgres:...@postgres.railway.internal:5432/railway`
   - `JWT_SECRET` → cambiar por uno seguro
   - `FRONTEND_URL` → URL del frontend en producción
   - `NODE_ENV=production`
   - Resto de variables igual
3. Railway detecta NestJS automáticamente y corre `npm run build && npm run start:prod`

### Pasos para deployar el frontend

**Opción A — Vercel (recomendado para Next.js):**
1. Conectar repo a Vercel
2. Root directory: `frontend`
3. Variable: `NEXT_PUBLIC_API_URL` → URL pública del backend en Railway

**Opción B — Railway:**
1. New Service → GitHub Repo → carpeta `frontend`
2. Build command: `npm run build`
3. Start command: `npm run start`
4. Variable: `NEXT_PUBLIC_API_URL`

### Para producción: cambiar sincronización por migraciones

En `app.module.ts`, cambiar `synchronize: true` por `synchronize: false` y usar migraciones de TypeORM:

```typescript
// Solo en producción
synchronize: false,
migrations: ['dist/migrations/*.js'],
migrationsRun: true,
```

---

## 15. Datos de prueba (seed)

**Archivo:** `backend/src/seed.ts`

Ejecutar solo en desarrollo:
```bash
cd backend
npx ts-node -r tsconfig-paths/register src/seed.ts
```

**Credenciales de acceso al panel:**
| Email | Password | Rol |
|---|---|---|
| admin@clipbooking.cl | admin123 | dueno |

> Cambiar la contraseña antes de subir a producción.

---

## 16. Roadmap y pendientes

### En progreso / siguiente
- [ ] Panel admin (frontend): agenda, caja, configuración de barberos/servicios/usuarios
- [ ] Panel barbero (frontend): vista de sus citas del día
- [ ] Recordatorio automático por WhatsApp (1h o 24h antes de la cita)
- [ ] Cancelación por cliente con token único (link en el mensaje de confirmación)

### Futuro (post-MVP)
- [ ] Multitenant: esquemas separados por barbería en la BD
- [ ] Dominio verificado en Resend para emails de producción
- [ ] Número WhatsApp Business aprobado por Meta (producción)
- [ ] Migrar `synchronize: true` → migraciones TypeORM para producción
- [ ] Separar BD de dev y prod en Railway
- [ ] Dashboard de métricas para el dueño
- [ ] Sistema de suscripción (cobro mensual a la barbería)

### Decisiones arquitecturales tomadas
| Decisión | Motivo |
|---|---|
| Soft delete (activo=false) en lugar de DELETE | Preservar historial de citas |
| Precio copiado al crear cita | Evitar que cambios de precio afecten citas pasadas |
| findOrCreate para clientes | Un cliente puede tener múltiples citas sin registrarse |
| Notificaciones no bloquean respuesta | UX: el cliente ve la confirmación inmediatamente |
| Cache de servicios/barberos en Next.js | Son datos de dominio que solo cambia el admin |
| synchronize: true en dev | Facilita iteración rápida; cambiar a migraciones en prod |
