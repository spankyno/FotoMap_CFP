# FotoMap 🗺️

Visualiza tus fotos con GPS en un mapa interactivo. Desplegado en **Cloudflare Pages** con **D1** como base de datos.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Mapa:** Leaflet + react-leaflet
- **Auth:** Auth propio con PBKDF2 + JWT (Web Crypto API)
- **Backend:** Cloudflare Pages Functions
- **BD:** Cloudflare D1 (SQLite en el edge)

---

## Despliegue en Cloudflare Pages

### 1. Instalar Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2. Crear la base de datos D1
```bash
wrangler d1 create fotomap-db
```
Copia el `database_id` que devuelve y pégalo en `wrangler.toml`:
```toml
database_id = "TU_DATABASE_ID_AQUI"
```

### 3. Aplicar el schema
```bash
# En remoto (producción)
wrangler d1 execute fotomap-db --remote --file=schema.sql

# En local (desarrollo)
wrangler d1 execute fotomap-db --local --file=schema.sql
```

### 4. Variables de entorno en Cloudflare
En el panel de Cloudflare Pages → tu proyecto → **Settings → Environment Variables**, añade:

| Variable | Valor |
|---|---|
| `JWT_SECRET` | Una cadena aleatoria larga y segura |

### 5. Configurar el proyecto en Cloudflare Pages
- **Framework preset:** None (Vite)
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** 18 o superior

### 6. Desplegar
Conecta tu repositorio de GitHub en el panel de Cloudflare Pages y hará el build automáticamente en cada push a `main`.

---

## Desarrollo local

```bash
npm install

# Build del frontend
npm run build

# Servidor local con Pages Functions + D1 local
npm run pages:dev
```

> `pages:dev` levanta Wrangler con las Pages Functions y la D1 local simultáneamente.

---

## Estructura del proyecto

```
├── functions/
│   └── api/
│       ├── _jwt.ts          # JWT con Web Crypto API
│       ├── _crypto.ts       # Hash PBKDF2 sin dependencias externas
│       ├── projects.ts      # GET / POST / DELETE proyectos
│       └── auth/
│           ├── login.ts     # POST /api/auth/login
│           └── register.ts  # POST /api/auth/register
├── src/
│   ├── auth/
│   │   ├── AuthContext.tsx  # Context de autenticación
│   │   └── AuthModal.tsx    # Modal login/registro
│   ├── components/
│   │   ├── Gallery/
│   │   ├── Map/
│   │   ├── Sidebar/
│   │   └── Dashboard/
│   └── stores/
│       └── useAppStore.ts   # Estado global (Zustand)
├── schema.sql               # Schema para D1
└── wrangler.toml            # Configuración Cloudflare
```
