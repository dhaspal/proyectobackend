# Esquema de Base de Datos (MongoDB / Mongoose)

Generado automáticamente desde los modelos en `src/models`.

- **Motor**: MongoDB
- **Conexión (MONGO_URI)**: `mongodb://127.0.0.1:27017/taller`

## Comparativa (general)

| CARACTERÍSTICA | MODELO RELACIONAL | MODELO FÍSICO |
| --- | --- | --- |
| Objetivo | Organizar la lógica del negocio. | Optimizar el rendimiento y almacenamiento. |
| Componentes | Entidades, atributos, relaciones. | Tablas, columnas, tipos de datos, índices. |
| Independencia | Es independiente del DBMS. | Es específico para un software (SQL Server, Oracle, etc.). |

## Aplicado a este proyecto (modelo documental)

| CARACTERÍSTICA | MODELO LÓGICO (Mongoose) | MODELO FÍSICO (MongoDB) |
| --- | --- | --- |
| Objetivo | Definir la estructura de documentos, validaciones y referencias entre colecciones. | Persistir documentos e índices reales en colecciones dentro de la base de datos. |
| Componentes | Colecciones (models), campos (paths), subdocumentos (schemas embebidos), refs (ObjectId). | Colecciones, documentos BSON, índices (incl. compuestos/unique), configuración del servidor. |
| Independencia | Atado a Mongoose como capa de modelado (pero no a un vendor SQL). | Específico de MongoDB (BSON, índices, storage engine). |

## Colecciones

### Appointment

- **Colección**: `appointments`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| client | ObjectId | Sí | - | Sí | User | - |
| clientNote | String | No | - | No | - | trim |
| completedAt | Date | No | - | No | - | - |
| createdAt | Date | No | - | No | - | - |
| createdBy | ObjectId | Sí | - | Sí | User | - |
| description | String | No | - | No | - | trim |
| durationMin | Number | No | 60 | No | - | min=5, max=480 |
| incompleteReason | String | No | - | No | - | trim |
| mechanic | ObjectId | No | - | Sí | User | - |
| proposedAt | Date | No | - | No | - | - |
| requestedAt | Date | Sí | - | Sí | - | - |
| scheduledAt | Date | No | - | Sí | - | - |
| status | String | No | "REQUESTED" | Sí | - | enum=[REQUESTED, ACCEPTED, REJECTED, RESCHEDULE_PROPOSED, CONFIRMED, CANCELLED, COMPLETED, INCOMPLETE] |
| title | String | Sí | - | No | - | trim |
| updatedAt | Date | No | - | No | - | - |
| vehicle | ObjectId | Sí | - | Sí | Vehicle | - |
| workOrder | ObjectId | No | - | Sí | WorkOrder | - |
| workshopNote | String | No | - | No | - | trim |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (client:1) [name=client_1]
  - (createdBy:1) [name=createdBy_1]
  - (mechanic:1) [name=mechanic_1]
  - (requestedAt:1) [name=requestedAt_1]
  - (scheduledAt:1) [name=scheduledAt_1]
  - (status:1) [name=status_1]
  - (vehicle:1) [name=vehicle_1]
  - (workOrder:1) [name=workOrder_1]

- **Referencias (relaciones)**:
  - client -> User
  - createdBy -> User
  - mechanic -> User
  - vehicle -> Vehicle
  - workOrder -> WorkOrder

### Inspection

- **Colección**: `inspections`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| appointment | ObjectId | No | - | Sí | Appointment | - |
| attachments | Array<String> | No | - | No | - | elem: trim |
| client | ObjectId | Sí | - | Sí | User | - |
| createdAt | Date | No | - | No | - | - |
| createdBy | ObjectId | Sí | - | Sí | User | - |
| inspectedAt | Date | Sí | func() | Sí | - | - |
| items | Array<Subdocumento> | No | [] | No | - | - |
| mechanic | ObjectId | No | - | Sí | User | - |
| mileage | Number | No | - | No | - | min=0 |
| recommendations | String | No | - | No | - | trim |
| summary | String | No | - | No | - | trim |
| updatedAt | Date | No | - | No | - | - |
| vehicle | ObjectId | Sí | - | Sí | Vehicle | - |
| workOrder | ObjectId | No | - | Sí | WorkOrder | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (appointment:1) [name=appointment_1]
  - (client:1) [name=client_1]
  - (createdBy:1) [name=createdBy_1]
  - (inspectedAt:1) [name=inspectedAt_1]
  - (mechanic:1) [name=mechanic_1]
  - (vehicle:1) [name=vehicle_1]
  - (workOrder:1) [name=workOrder_1]

- **Referencias (relaciones)**:
  - appointment -> Appointment
  - client -> User
  - createdBy -> User
  - mechanic -> User
  - vehicle -> Vehicle
  - workOrder -> WorkOrder

### Notification

- **Colección**: `notifications`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| createdAt | Date | No | - | No | - | - |
| data | Mixed | No | - | No | - | - |
| message | String | Sí | - | No | - | trim |
| readAt | Date | No | null | Sí | - | - |
| title | String | Sí | - | No | - | trim |
| type | String | Sí | - | Sí | - | trim |
| updatedAt | Date | No | - | No | - | - |
| user | ObjectId | Sí | - | Sí | User | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (readAt:1) [name=readAt_1]
  - (type:1) [name=type_1]
  - (user:1) [name=user_1]

- **Referencias (relaciones)**:
  - user -> User

### Schedule

- **Colección**: `schedules`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| createdAt | Date | No | - | No | - | - |
| date | Date | Sí | - | Sí | - | - |
| entries | Array<Subdocumento> | No | [] | No | - | - |
| mechanic | ObjectId | Sí | - | Sí | User | - |
| updatedAt | Date | No | - | No | - | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (date:1) [name=date_1]
  - (mechanic:1, date:1) [unique, name=mechanic_1_date_1]
  - (mechanic:1) [name=mechanic_1]

- **Referencias (relaciones)**:
  - mechanic -> User

### Service

- **Colección**: `services`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| basePrice | Number | No | 0 | No | - | min=0 |
| category | String | No | - | Sí | - | trim |
| createdAt | Date | No | - | No | - | - |
| description | String | No | - | No | - | trim |
| durationMin | Number | No | 60 | No | - | min=5, max=480 |
| isActive | Boolean | No | true | Sí | - | - |
| name | String | Sí | - | No | - | trim |
| updatedAt | Date | No | - | No | - | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (category:1) [name=category_1]
  - (isActive:1) [name=isActive_1]
  - (name:1) [name=name_1]

- **Referencias (relaciones)**:
  - (sin refs)

### Transaction

- **Colección**: `transactions`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| amount | Number | Sí | - | No | - | min=0 |
| category | String | No | - | No | - | trim |
| createdAt | Date | No | - | No | - | - |
| createdBy | ObjectId | Sí | - | Sí | User | - |
| currency | String | No | "USD" | No | - | trim |
| date | Date | Sí | func() | Sí | - | - |
| description | String | No | - | No | - | trim |
| mechanic | ObjectId | No | - | Sí | User | - |
| type | String | Sí | - | Sí | - | enum=[INCOME, EXPENSE] |
| updatedAt | Date | No | - | No | - | - |
| workOrder | ObjectId | No | - | Sí | WorkOrder | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (createdBy:1) [name=createdBy_1]
  - (date:1) [name=date_1]
  - (mechanic:1) [name=mechanic_1]
  - (type:1) [name=type_1]
  - (workOrder:1) [name=workOrder_1]

- **Referencias (relaciones)**:
  - createdBy -> User
  - mechanic -> User
  - workOrder -> WorkOrder

### User

- **Colección**: `users`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| age | Number | No | - | No | - | min=0, max=120 |
| clientProfile.address | String | No | - | No | - | trim |
| createdAt | Date | No | - | No | - | - |
| dateOfBirth | Date | No | - | No | - | - |
| firstName | String | No | - | No | - | trim |
| isActive | Boolean | No | true | No | - | - |
| lastName | String | No | - | No | - | trim |
| mechanicProfile.hourlyRate | Number | No | - | No | - | min=0 |
| mechanicProfile.specialties | Array<String> | No | - | No | - | elem: trim |
| name | String | Sí | - | No | - | trim |
| passwordHash | String | No | - | No | - | - |
| phone | String | No | - | No | - | trim |
| role | String | Sí | "CLIENT" | No | - | enum=[ADMIN, MECHANIC, CLIENT] |
| updatedAt | Date | No | - | No | - | - |
| username | String | Sí | - | No | - | trim, lowercase |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (authProviders.google.sub:1) [name=authProviders.google.sub_1]
  - (email:1) [unique, sparse, name=email_1]
  - (username:1) [unique, name=username_1]

- **Referencias (relaciones)**:
  - (sin refs)

### Vehicle

- **Colección**: `vehicles`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| brand | String | Sí | - | No | - | trim |
| color | String | No | - | No | - | trim |
| createdAt | Date | No | - | No | - | - |
| fuelType | String | No | - | No | - | trim |
| mileage | Number | No | - | No | - | min=0 |
| model | String | Sí | - | No | - | trim |
| notes | String | No | - | No | - | trim |
| owner | ObjectId | Sí | - | Sí | User | - |
| plate | String | No | - | Sí | - | trim, uppercase |
| updatedAt | Date | No | - | No | - | - |
| vin | String | No | - | Sí | - | trim, uppercase |
| year | Number | No | - | No | - | min=1900, max=2100 |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (owner:1, plate:1) [name=owner_1_plate_1]
  - (owner:1) [name=owner_1]
  - (plate:1) [name=plate_1]
  - (vin:1) [name=vin_1]

- **Referencias (relaciones)**:
  - owner -> User

### WorkOrder

- **Colección**: `workorders`
- **Clave primaria**: `_id: ObjectId`

| Campo | Tipo | Requerido | Default | Índice | Referencia | Notas/Restricciones |
| --- | --- | --- | --- | --- | --- | --- |
| _id | ObjectId | No | - | No | - | - |
| client | ObjectId | Sí | - | Sí | User | - |
| clientNotes | String | No | - | No | - | trim |
| cost | Number | No | - | No | - | min=0 |
| createdAt | Date | No | - | No | - | - |
| diagnosis | String | No | - | No | - | trim |
| finishedAt | Date | No | - | No | - | - |
| internalNotes | String | No | - | No | - | trim |
| laborHours | Number | No | 0 | No | - | min=0 |
| laborRate | Number | No | 0 | No | - | min=0 |
| mechanic | ObjectId | No | - | Sí | User | - |
| mileage | Number | No | - | No | - | min=0 |
| parts | Array<Subdocumento> | No | [] | No | - | - |
| problemDescription | String | No | - | No | - | trim |
| repairDescription | String | No | - | No | - | trim |
| startedAt | Date | No | - | No | - | - |
| status | String | No | "OPEN" | Sí | - | enum=[REQUESTED, OPEN, IN_PROGRESS, DONE, DELIVERED, CANCELLED] |
| title | String | Sí | - | No | - | trim |
| updatedAt | Date | No | - | No | - | - |
| vehicle | ObjectId | Sí | - | Sí | Vehicle | - |

- **Índices** (reales (DB)):
  - (_id:1) [name=_id_]
  - (client:1) [name=client_1]
  - (mechanic:1) [name=mechanic_1]
  - (status:1) [name=status_1]
  - (vehicle:1) [name=vehicle_1]

- **Referencias (relaciones)**:
  - client -> User
  - mechanic -> User
  - vehicle -> Vehicle

## Resumen de relaciones (refs)

- Appointment.client -> User
- Appointment.createdBy -> User
- Appointment.mechanic -> User
- Appointment.vehicle -> Vehicle
- Appointment.workOrder -> WorkOrder
- Inspection.appointment -> Appointment
- Inspection.client -> User
- Inspection.createdBy -> User
- Inspection.mechanic -> User
- Inspection.vehicle -> Vehicle
- Inspection.workOrder -> WorkOrder
- Notification.user -> User
- Schedule.mechanic -> User
- Transaction.createdBy -> User
- Transaction.mechanic -> User
- Transaction.workOrder -> WorkOrder
- Vehicle.owner -> User
- WorkOrder.client -> User
- WorkOrder.mechanic -> User
- WorkOrder.vehicle -> Vehicle

