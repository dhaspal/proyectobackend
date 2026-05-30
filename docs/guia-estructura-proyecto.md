# Estructura del proyecto (`proyectogradobackend`)

API REST en Node.js + Express + MongoDB (Mongoose).

```
proyectogradobackend/
├── package.json
├── package-lock.json
├── README.md
├── .env.example
├── .gitignore
│
├── src/
│   ├── index.js
│   ├── app.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── constants/
│   │   ├── appointments.js
│   │   ├── finance.js
│   │   ├── roles.js
│   │   └── workOrder.js
│   ├── controllers/
│   │   ├── appointments.controller.js
│   │   ├── auth.controller.js
│   │   ├── clients.controller.js
│   │   ├── inspections.controller.js
│   │   ├── notifications.controller.js
│   │   ├── schedules.controller.js
│   │   ├── services.controller.js
│   │   ├── transactions.controller.js
│   │   ├── users.controller.js
│   │   ├── vehicles.controller.js
│   │   └── workOrders.controller.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── rateLimit.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Inspection.js
│   │   ├── Notification.js
│   │   ├── Schedule.js
│   │   ├── Service.js
│   │   ├── Transaction.js
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   └── WorkOrder.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── appointments.routes.js
│   │   ├── auth.routes.js
│   │   ├── clients.routes.js
│   │   ├── health.routes.js
│   │   ├── inspections.routes.js
│   │   ├── notifications.routes.js
│   │   ├── realtime.routes.js
│   │   ├── schedules.routes.js
│   │   ├── services.routes.js
│   │   ├── transactions.routes.js
│   │   ├── users.routes.js
│   │   ├── vehicles.routes.js
│   │   └── workOrders.routes.js
│   ├── services/
│   │   ├── notifications.service.js
│   │   ├── realtime.service.js
│   │   └── schedule.service.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── password.js
│   │   └── tokens.js
│   └── validators/
│       ├── appointments.validators.js
│       ├── auth.validators.js
│       ├── clients.validators.js
│       ├── inspections.validators.js
│       ├── notifications.validators.js
│       ├── schedules.validators.js
│       ├── services.validators.js
│       ├── transactions.validators.js
│       ├── users.validators.js
│       ├── vehicles.validators.js
│       └── workOrders.validators.js
│
├── scripts/
│   ├── migrate-local-to-atlas.js
│   └── seed-services.js
│
└── docs/
    ├── esquema-bd.md
    └── guia-estructura-proyecto.md
```
