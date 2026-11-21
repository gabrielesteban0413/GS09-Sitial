# Sitial

Sitial es una aplicación para explorar ubicaciones comerciales. Permite iniciar sesión, buscar sitios en un mapa, consultar negocios cercanos y guardar ubicaciones organizadas en capas.

La aplicación web está construida con React y TypeScript; la API está construida con NestJS y Prisma, y almacena usuarios, análisis, competidores y capas en PostgreSQL. La aplicación móvil independiente está construida con Expo y React Native y consume la misma API. La carpeta histórica `Sitial/` es únicamente material de referencia visual/funcional y no forma parte del runtime de React, Expo o NestJS.

## Funcionalidades

- Registro, inicio y cierre de sesión con tokens JWT.
- Mapa interactivo de Google Maps para buscar direcciones y elegir ubicaciones.
- Búsqueda de competidores cercanos mediante Google Places.
- Análisis guardado por usuario, con datos consultados de competidores y un indicador de presión competitiva.
- Vista de informe con gráficos, tabla de competidores y opción de imprimir/guardar como PDF desde el navegador.
- Capas de ubicaciones: crear y eliminar capas, agregar sitios desde el mapa, mostrar/ocultar pines y moverlos arrastrando.
- Perfil de usuario con foto seleccionable desde galería/archivos, actualización de nombre, cambio de contraseña y cierre de sesión.
- Páginas públicas informativas y páginas privadas para mapa, análisis, capas, perfil y documentación.
- Aplicación móvil para Android e iOS con registro e inicio de sesión, búsqueda de direcciones, análisis de competencia, historial, capas, ubicaciones guardadas y perfil.
- Animaciones geoespaciales integradas en el mapa, el enfoque de ubicaciones, el progreso del análisis y la consulta de resultados.

La aplicación no genera un puntaje total de viabilidad: no tiene conectadas fuentes reales de afluencia peatonal, demografía ni transporte. Esos datos se muestran como no disponibles, y no se emite un veredicto de idoneidad a partir de valores inventados. Los resultados de competidores dependen de que Google Places esté habilitado y accesible. Antes de guardar un análisis, la API consulta Geocoding para rechazar puntos que Google no pueda identificar como ubicaciones terrestres.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Web | React 18, TypeScript, Vite, React Router, Google Maps JavaScript API, Recharts |
| Móvil | Expo SDK 58, React Native, Expo Router, SecureStore, react-native-maps |
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
├── mobile/
│   ├── app/                # Rutas y pantallas Expo Router
│   └── src/                # API, autenticación, estado y tema móvil
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

El servicio web publica `http://localhost:5173`, la API `http://localhost:8001` y PostgreSQL `localhost:5433`. La API usa el puerto interno `8000`; el puerto publicado `8001` evita conflictos con una API local iniciada con `npm run start:dev`. El contenedor de API ejecuta las migraciones pendientes al arrancar. Para el build de la web, asegúrate de que `frontend/.env` esté presente y contenga `VITE_GOOGLE_MAPS_API_KEY`; Vite incorpora las variables `VITE_` al bundle durante la compilación.

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
| `/app/perfil` | Requiere sesión | Perfil, seguridad y estado de pagos |
| `/app/documentacion` | Requiere sesión | Documentación de la aplicación |

Las rutas `/analysis`, `/analisis` y `/dashboard` redirigen a las vistas nuevas correspondientes.

## Aplicación móvil (Expo)

La aplicación de `mobile/` es un cliente nativo separado que reutiliza la API NestJS; no comparte componentes web ni crea otro backend. Al abrirla sin sesión muestra una portada móvil; después de iniciar sesión presenta Mapa, Análisis, Capas y Perfil desde un menú lateral. Las interacciones están integradas en esos flujos: el mapa permite desplazar, ampliar y girar; una ficha arrastrable guarda un sitio en la capa activa o inicia su análisis; las acciones tienen respuesta elástica y el análisis muestra progreso animado sin inventar porcentajes. El historial es un carrusel de análisis reales y, de forma opcional, agitar el dispositivo recentra el mapa mientras la app está activa. No hay una sección de demostración independiente. Incluye registro/inicio de sesión, token en almacenamiento seguro del dispositivo, búsqueda de direcciones, análisis basado en competidores, gestión de capas, ubicaciones guardadas y perfil con selección de foto desde la galería. Los pagos se identifican como no conectados y no se simula una suscripción.

### Configuración móvil

Las variables móviles se leen desde el entorno o desde un `mobile/.env` local (ignorado por Git). No agregues claves al código ni reutilices para el mapa nativo la clave privada del backend.

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL accesible desde el teléfono, con prefijo `/api/v1`; por ejemplo `http://192.168.1.10:8000/api/v1` |
| `GOOGLE_MAPS_ANDROID_API_KEY` | Clave del **Maps SDK for Android**, restringida al paquete `com.sitial.mobile` y a su SHA-1 |
| `GOOGLE_MAPS_IOS_API_KEY` | Clave del **Maps SDK for iOS**, restringida al bundle identifier `com.sitial.mobile` |

Habilita **Maps SDK for Android** y **Maps SDK for iOS** en Google Cloud. Las claves nativas se configuran en `mobile/app.config.ts` durante la generación/build nativo. Son claves cliente incluidas en el binario, no secretos: restríngelas por aplicación y API. La clave web `VITE_GOOGLE_MAPS_API_KEY` corresponde a Maps JavaScript y la clave `GOOGLE_MAPS_API_KEY` del backend se conserva para las llamadas de servidor a Geocoding/Places; pueden requerir claves distintas con restricciones apropiadas.

Durante el desarrollo, si Expo anuncia una dirección LAN, la app usa automáticamente el host de Metro y el puerto `8000` para encontrar la API. Si necesitas fijarlo, configura `EXPO_PUBLIC_API_URL` con la IP LAN del equipo que ejecuta NestJS y asegúrate de que el celular y el computador estén en la misma red Wi-Fi. Por ejemplo, para una IP `192.168.1.2`: `$env:EXPO_PUBLIC_API_URL="http://192.168.1.2:8000/api/v1"`. En un teléfono, `localhost` apunta al propio teléfono, no al computador. En el emulador Android sin host LAN disponible, el fallback es `10.0.2.2`; en iOS Simulator, `localhost`.

Para abrir la app en Expo Go, deja activo el backend y ejecuta `npx expo start --lan` desde `mobile/`; escanea el QR con Expo Go mientras el celular está en la misma Wi-Fi. No hace falta iniciar sesión en Expo para usar LAN. Tunnel sí requiere iniciar sesión o instalar/configurar ngrok. Si el teléfono no puede iniciar sesión, comprueba la dirección de API que muestra el error, que NestJS esté escuchando en el puerto `8000` y que el Firewall de Windows permita conexiones entrantes. `localhost` y una IP LAN distinta a la actual no son accesibles desde el celular.

### Ejecutar

Instala dependencias y levanta Expo desde la carpeta móvil:

```powershell
cd mobile
npm install
npx expo start
```

Para iniciar directamente en simuladores/dispositivos con las herramientas nativas instaladas:

```powershell
npx expo run:android
npx expo run:ios
```

Android requiere Android Studio/SDK para compilar localmente; iOS requiere macOS y Xcode. Para instalar una app nativa en dispositivos físicos o publicar, genera un development build o build de producción con EAS; las claves nativas de mapas deben estar disponibles en el entorno de build. Un teléfono físico conectado a Expo Go puede requerir una versión de Expo Go compatible con el SDK del proyecto.

Comprobaciones locales:

```powershell
npm run typecheck
npx expo-doctor
npx expo lint
```

## API

Prefijo: `/api/v1`. Las rutas privadas requieren el token JWT enviado en `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio |
| `GET` | `/health/ready` | Estado de disponibilidad |
| `POST` | `/auth/register` | Crear una cuenta |
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/auth/me` | Obtener el usuario autenticado |
| `PATCH` | `/auth/me` | Actualizar el perfil, incluida la foto de usuario |
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

Aplicación móvil:

```powershell
cd mobile
npm run start
npm run typecheck
npx expo-doctor
npx expo lint
```

## Notas de mantenimiento

- No agregues archivos `.env` al control de versiones; contienen configuración local y potencialmente credenciales.
- Prisma obtiene su modelo de `backend/prisma/schema.prisma`. Las migraciones versionadas están en `backend/prisma/migrations/`.
- Si modificas el esquema, genera/aplica la migración en desarrollo y comprueba el build de ambos paquetes. La migración `20261025195000_remove_synthetic_analysis_metrics` permite guardar campos de idoneidad y afluencia como `NULL` cuando no hay datos verificables. Los análisis históricos conservan sus datos persistidos, pero sus puntuaciones y métricas sintéticas ya no se presentan como resultados válidos.
- La foto de perfil se puede seleccionar desde la galería en móvil o desde archivos en web; se redimensiona antes de guardarse en la cuenta.
- La aplicación web se comunica con `/api/v1`; Vite lo redirige a `http://localhost:8000` durante el desarrollo y Nginx lo proxifica al servicio `api` en Compose.
- Los endpoints y módulos aún no listados como funcionalidades implementadas no deben asumirse disponibles; consulta Swagger y el código del backend.
