# Sitial

Sitial es una aplicación para explorar ubicaciones comerciales. Permite iniciar sesión, buscar sitios en un mapa, consultar negocios cercanos y guardar ubicaciones organizadas en capas.

La aplicación web está construida con React y TypeScript; la API está construida con NestJS y Prisma, y almacena usuarios, análisis, competidores y capas en PostgreSQL. La carpeta histórica `Sitial/` es únicamente material de referencia visual/funcional y no forma parte del runtime de React o NestJS.

## Funcionalidades

- Registro, inicio y cierre de sesión con tokens JWT.
- Mapa interactivo de Google Maps para buscar direcciones y elegir ubicaciones.
- Búsqueda de competidores cercanos mediante Google Places.
- Análisis guardado por usuario, con datos consultados de competidores y un indicador de presión competitiva.
- Vista de informe con gráficos, tabla de competidores y opción de imprimir/guardar como PDF desde el navegador.
- Capas de ubicaciones: crear y eliminar capas, agregar sitios desde el mapa, mostrar/ocultar pines y moverlos arrastrando.
- Páginas públicas informativas y páginas privadas para mapa, análisis, capas y documentación.

La aplicación no genera un puntaje total de viabilidad: no tiene conectadas fuentes reales de afluencia peatonal, demografía ni transporte. Esos datos se muestran como no disponibles, y no se emite un veredicto de idoneidad a partir de valores inventados. Los resultados de competidores dependen de que Google Places esté habilitado y accesible. Antes de guardar un análisis, la API consulta Geocoding para rechazar puntos que Google no pueda identificar como ubicaciones terrestres.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, Google Maps JavaScript API, Recharts |
| Backend | Node.js 20+, NestJS 10, TypeScript, Prisma 5 |
| Datos | PostgreSQL 16 |
| Contenedores | Docker Compose |

## Estructura del repositorio

```text
.
├── backend/
│   ├── prisma/             # Esquema y migraciones de PostgreSQL
│   └── src/                # Módulos de autenticación, análisis, mapas, capas y competidores
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/     # Shell, mapa y componentes reutilizables
│       ├── context/        # Estado de autenticación
│       ├── pages/          # Rutas y pantallas
│       └── styles/         # Estilos de la aplicación
├── docker-compose.yml
└── README.md
```

## Requisitos

- Node.js 20 o posterior y npm.
- PostgreSQL 16, o Docker Desktop para iniciar PostgreSQL/servicios con Compose.
- Una configuración de Google Cloud con **Maps JavaScript API**, **Places API (New)** y **Geocoding API** habilitadas.

Restringe la clave de navegador por HTTP referrer y por API. Para las llamadas de servidor de Places y Geocoding, usa una clave con esas APIs permitidas y restricciones adecuadas para el servidor; una clave limitada a referrers de navegador no autorizará las llamadas del backend.

## Configuración local

El proyecto usa archivos `.env` locales que no deben subirse al repositorio. Si ya tienes tus archivos de entorno, consérvalos y comprueba que tengan las variables requeridas; no es necesario copiar ningún `.env.example`.

### 1. Variables de entorno

En `backend/.env` configura:

```dotenv
DATABASE_URL="postgresql://sitial:TU_PASSWORD@localhost:5433/sitial?schema=public"
JWT_SECRET="un-secreto-aleatorio-largo"
JWT_EXPIRES_IN="3600"
GOOGLE_MAPS_API_KEY="tu-clave-de-google"
```

En `frontend/.env` configura:

```dotenv
VITE_API_URL="/api/v1"
VITE_GOOGLE_MAPS_API_KEY="tu-clave-de-google"
```

La clave `VITE_GOOGLE_MAPS_API_KEY` se entrega al navegador y, por tanto, no es secreta. Debe tener restricciones de referrer/API en Google Cloud. La clave `GOOGLE_MAPS_API_KEY` del backend se usa para solicitudes de Places/Geocoding desde el servidor. Pueden ser la misma clave si sus restricciones lo permiten; una clave separada por uso suele ser más segura.

La búsqueda de direcciones y la validación de puntos se realizan en el backend con `GOOGLE_MAPS_API_KEY`, no con el geocoder del navegador. Si Google devuelve `REQUEST_DENIED`, verifica que **Geocoding API** esté habilitada para esa clave, que la facturación esté activa y que sus restricciones permitan llamadas desde el servidor. La búsqueda de direcciones del frontend requiere una sesión activa.

Para generar un secreto JWT local:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Configura `DATABASE_URL` con el host, puerto, usuario, contraseña y base reales de tu instalación. El ejemplo de arriba coincide con el puerto publicado por el servicio PostgreSQL de `docker-compose.yml`.

### 2. Iniciar PostgreSQL

Desde la raíz del repositorio:

```powershell
docker compose up -d postgres
```

El servicio publica PostgreSQL en `localhost:5433`. El Compose tiene un usuario/base de datos para desarrollo y admite `POSTGRES_PASSWORD` en el `.env` de la raíz; si cambias la contraseña, mantén `DATABASE_URL` sincronizada. No uses las credenciales por defecto para un despliegue real.

También puedes usar una instancia PostgreSQL externa; en ese caso no necesitas iniciar el servicio `postgres` de Compose.

### 3. Instalar dependencias, generar Prisma y aplicar migraciones

En una terminal:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

`prisma:migrate` aplica las migraciones existentes en desarrollo y puede solicitar un nombre si se detectan cambios nuevos en el esquema.

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. La API estará en `http://localhost:8000/api/v1`.

## Ejecución con Docker Compose

Desde la raíz del repositorio, el `.env` raíz debe contener `JWT_SECRET` y `GOOGLE_MAPS_API_KEY`; puedes definir también `POSTGRES_PASSWORD`. Para compilar e iniciar los tres servicios:

```powershell
docker compose up --build -d
```

El servicio web publica `http://localhost:5173`, la API `http://localhost:8000` y PostgreSQL `localhost:5433`. El contenedor de API ejecuta las migraciones pendientes al arrancar. Para el build de la web, asegúrate de que `frontend/.env` esté presente y contenga `VITE_GOOGLE_MAPS_API_KEY`; Vite incorpora las variables `VITE_` al bundle durante la compilación.

Comandos útiles:

```powershell
docker compose logs -f api
docker compose logs -f web
docker compose down
```

Los datos de PostgreSQL se conservan en el volumen `postgres_data`. `docker compose down` no elimina dicho volumen.

## Rutas web

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Público | Página de inicio |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro |
| `/pago`, `/nosotros`, `/contacto` | Público | Páginas informativas |
| `/privacidad`, `/terminos`, `/cookies` | Público | Información legal |
| `/app` | Requiere sesión | Mapa y análisis de ubicación |
| `/app/analisis` | Requiere sesión | Informe del último análisis |
| `/app/capas` | Requiere sesión | Gestión de capas y ubicaciones |
| `/app/documentacion` | Requiere sesión | Documentación de la aplicación |

Las rutas `/analysis`, `/analisis` y `/dashboard` redirigen a las vistas nuevas correspondientes.

## API

Prefijo: `/api/v1`. Las rutas privadas requieren el token JWT enviado en `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio |
| `GET` | `/health/ready` | Estado de disponibilidad |
| `POST` | `/auth/register` | Crear una cuenta |
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/auth/me` | Obtener el usuario autenticado |
| `POST` | `/analysis` | Crear y guardar un análisis |
| `GET` | `/analysis` | Listar análisis del usuario autenticado |
| `POST` | `/competitors/search` | Buscar negocios competidores cercanos |
| `GET` | `/places/geocode?address=...` | Buscar una dirección en Colombia |
| `GET` | `/layers` | Listar capas del usuario |
| `POST` | `/layers` | Crear una capa |
| `DELETE` | `/layers/:layerId` | Eliminar una capa y sus ubicaciones |
| `GET` | `/layers/:layerId/locations` | Listar ubicaciones de una capa |
| `POST` | `/layers/:layerId/locations` | Agregar una ubicación a una capa |
| `PATCH` | `/locations/:locationId` | Actualizar una ubicación |
| `DELETE` | `/locations/:locationId` | Eliminar una ubicación |

La API interactiva de Swagger está disponible en `http://localhost:8000/api/v1/docs`.

## Comandos de desarrollo

Backend:

```powershell
cd backend
npm run build
npm run start:dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
```

Frontend:

```powershell
cd frontend
npm run build
npm run dev
npm run preview
```

## Notas de mantenimiento

- No agregues archivos `.env` al control de versiones; contienen configuración local y potencialmente credenciales.
- Prisma obtiene su modelo de `backend/prisma/schema.prisma`. Las migraciones versionadas están en `backend/prisma/migrations/`.
- Si modificas el esquema, genera/aplica la migración en desarrollo y comprueba el build de ambos paquetes. La migración `20261025195000_remove_synthetic_analysis_metrics` permite guardar campos de idoneidad y afluencia como `NULL` cuando no hay datos verificables. Los análisis históricos conservan sus datos persistidos, pero sus puntuaciones y métricas sintéticas ya no se presentan como resultados válidos.
- La aplicación web se comunica con `/api/v1`; Vite lo redirige a `http://localhost:8000` durante el desarrollo y Nginx lo proxifica al servicio `api` en Compose.
- Los endpoints y módulos aún no listados como funcionalidades implementadas no deben asumirse disponibles; consulta Swagger y el código del backend.
