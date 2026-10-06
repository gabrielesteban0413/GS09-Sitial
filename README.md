# Sitial - Location Intelligence API

Proyecto academico de investigacion comparativa de frameworks backend.
Framework seleccionado: Node.js (NestJS).

## Contexto

API REST que evalua sitios comerciales combinando Google Maps, demografia,
competencia y accesibilidad en un score ponderado. El frontend es React con
TypeScript, lo que permite compartir tipos con el backend escrito tambien en
TypeScript.

## Stack

- Backend: NestJS 10, Prisma 5, PostgreSQL 16, TypeScript 5.6
- Frontend: React 18, Vite 6, TypeScript 5.6
- Infraestructura: Docker Compose

## Estructura

GS09-Sitial/
backend/ NestJS + Prisma + PostgreSQL
frontend/ React + Vite
docs/ Informe y presentacion
docker-compose.yml
README.md



## Requisitos previos

- Node.js 20+
- Docker Desktop
- API key de Google Cloud (Places + Geocoding)

## Instalacion

### Backend

En PowerShell:


cd backend
npm install
copy .env.example .env



Editar backend\.env con:

- JWT_SECRET: genera con node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
- GOOGLE_MAPS_API_KEY: tu API key de Google Cloud


cd ..
docker compose up -d postgres
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev


### Frontend

En otra terminal:


cd frontend
npm install
copy .env.example .env
npm run dev



## URLs

- API: http://localhost:8000/api/v1
- Swagger: http://localhost:8000/api/v1/docs
- Frontend: http://localhost:5173

## Endpoints


POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me

POST /api/v1/analysis
GET /api/v1/analysis
DELETE /api/v1/analysis/{id}

POST /api/v1/competitors/search


## Comparativa resumida (Node.js vs otros)

| Criterio | Node.js | Django | Flask | Rails |
|---|---|---|---|---|
| Rendimiento | Muy bueno | Medio | Medio | Medio |
| Async nativo | Si | Parcial | No | No |
| TypeScript end-to-end | Si | No | No | No |
| Docs automaticas | Si | Parcial | No | No |
| Curva de aprendizaje | Media | Alta | Baja | Media |

## Autor

Andres Sanchez - Investigacion Segundo Momento
