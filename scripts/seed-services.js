require("dotenv").config();

const { connectDb } = require("../src/config/db");
const { Service } = require("../src/models/Service");

const services = [
  {
    name: "Cambio de aceite",
    category: "Mantenimiento",
    description: "Cambio de aceite de motor (incluye revisión visual).",
    basePrice: 120000,
    durationMin: 60,
    isActive: true,
  },
  {
    name: "Cambio de filtro de aceite",
    category: "Mantenimiento",
    description: "Reemplazo del filtro de aceite.",
    basePrice: 30000,
    durationMin: 20,
    isActive: true,
  },
  {
    name: "Alineación",
    category: "Llantas/Suspensión",
    description: "Alineación de dirección y verificación de ángulos.",
    basePrice: 90000,
    durationMin: 45,
    isActive: true,
  },
  {
    name: "Balanceo",
    category: "Llantas/Suspensión",
    description: "Balanceo de ruedas para eliminar vibraciones.",
    basePrice: 60000,
    durationMin: 40,
    isActive: true,
  },
  {
    name: "Rotación de llantas",
    category: "Llantas/Suspensión",
    description: "Rotación para desgaste uniforme.",
    basePrice: 40000,
    durationMin: 30,
    isActive: true,
  },
  {
    name: "Escaneo OBD2",
    category: "Diagnóstico",
    description: "Lectura de códigos de falla y datos básicos.",
    basePrice: 50000,
    durationMin: 30,
    isActive: true,
  },
  {
    name: "Diagnóstico eléctrico",
    category: "Diagnóstico",
    description: "Pruebas de sistema eléctrico y búsqueda de fallas.",
    basePrice: 120000,
    durationMin: 90,
    isActive: true,
  },
  {
    name: "Cambio de batería",
    category: "Eléctrico",
    description: "Instalación de batería y prueba de carga/arranque.",
    basePrice: 80000,
    durationMin: 30,
    isActive: true,
  },
  {
    name: "Cambio de pastillas de freno",
    category: "Frenos",
    description: "Reemplazo de pastillas (por eje).",
    basePrice: 180000,
    durationMin: 120,
    isActive: true,
  },
  {
    name: "Rectificación/cambio de discos",
    category: "Frenos",
    description: "Servicio de discos (según diagnóstico).",
    basePrice: 220000,
    durationMin: 180,
    isActive: true,
  },
  {
    name: "Cambio de líquido de frenos",
    category: "Frenos",
    description: "Purgado y reemplazo del líquido de frenos.",
    basePrice: 90000,
    durationMin: 60,
    isActive: true,
  },
  {
    name: "Revisión general (inspección)",
    category: "Inspección",
    description: "Checklist general (frenos, luces, fluidos, llantas, fugas).",
    basePrice: 70000,
    durationMin: 60,
    isActive: true,
  },
  {
    name: "Cambio de bujías",
    category: "Motor",
    description: "Reemplazo de bujías y verificación de encendido.",
    basePrice: 140000,
    durationMin: 90,
    isActive: true,
  },
  {
    name: "Cambio de filtro de aire",
    category: "Motor",
    description: "Reemplazo de filtro de aire del motor.",
    basePrice: 25000,
    durationMin: 15,
    isActive: true,
  },
  {
    name: "Cambio de refrigerante",
    category: "Motor",
    description: "Drenaje y reposición de refrigerante (con purga).",
    basePrice: 110000,
    durationMin: 90,
    isActive: true,
  },
];

async function main() {
  await connectDb();

  let created = 0;
  let updated = 0;

  for (const s of services) {
    const existing = await Service.findOne({ name: s.name });
    if (!existing) {
      await Service.create(s);
      created += 1;
    } else {
      existing.category = s.category;
      existing.description = s.description;
      existing.basePrice = s.basePrice;
      existing.durationMin = s.durationMin;
      existing.isActive = s.isActive;
      await existing.save();
      updated += 1;
    }
  }

  const total = await Service.countDocuments();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ created, updated, total }, null, 2));
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed error:", err);
  process.exit(1);
});

