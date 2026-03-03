# Backend Taller (Node.js + MongoDB)

API para administrar un taller: usuarios (cliente/mecánico/admin), vehículos, órdenes de trabajo, horarios y finanzas.

## Requisitos
- Node.js 18+
- MongoDB corriendo local o remoto

## Configuración
1. Copia `.env.example` a `.env` y ajusta valores.
2. Inicia MongoDB y luego:

```bash
npm i
npm run dev
```

## Healthcheck
- `GET /api/health`

## Auth
- `POST /api/auth/register` (usa `username`, role: CLIENT o MECHANIC)
- `POST /api/auth/login` (usa `username`)
- `GET /api/auth/me` (Bearer token)

## Roles (RBAC)
- **CLIENT**: CRUD de sus vehículos. Ver sus órdenes. Crear solicitudes de orden (REQUESTED) para sus vehículos.
- **MECHANIC**: Ver vehículos asociados a sus órdenes. CRUD de sus horarios. CRUD de sus transacciones. CRUD/actualización de sus órdenes asignadas.
- **ADMIN**: Acceso total.

## Vehicles
- `POST /api/vehicles` (CLIENT/ADMIN)
- `GET /api/vehicles` (auth, filtra por rol)
- `GET /api/vehicles/:id` (auth)
- `PATCH /api/vehicles/:id` (CLIENT/ADMIN)
- `DELETE /api/vehicles/:id` (CLIENT/ADMIN)

## Work Orders
- `POST /api/work-orders` (CLIENT/MECHANIC/ADMIN)
- `GET /api/work-orders` (auth, filtra por rol)
- `GET /api/work-orders/:id` (auth)
- `PATCH /api/work-orders/:id` (MECHANIC/ADMIN)
- `PATCH /api/work-orders/:id/client` (CLIENT)
- `POST /api/work-orders/:id/claim` (MECHANIC/ADMIN)
- `DELETE /api/work-orders/:id` (ADMIN)

## Schedules (horarios)
- `GET /api/schedules` (MECHANIC/ADMIN)
- `POST /api/schedules` (MECHANIC/ADMIN) (upsert por día)
- `GET /api/schedules/:id` (MECHANIC/ADMIN)
- `DELETE /api/schedules/:id` (MECHANIC/ADMIN)

## Finanzas (transactions)
- `GET /api/finance/transactions` (MECHANIC/ADMIN)
- `POST /api/finance/transactions` (MECHANIC/ADMIN)
- `GET /api/finance/transactions/:id` (MECHANIC/ADMIN)
- `PATCH /api/finance/transactions/:id` (MECHANIC/ADMIN)
- `DELETE /api/finance/transactions/:id` (MECHANIC/ADMIN)

## Users (admin)
- `GET /api/users` (ADMIN)
- `POST /api/users` (ADMIN)
- `PATCH /api/users/:id/admin` (ADMIN)
- `GET /api/users/:id` (ADMIN o self)
- `PATCH /api/users/:id` (self)

