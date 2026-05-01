/**
 * Copia todas las colecciones de la BD local `taller` hacia Atlas.
 * Requiere MongoDB local en marcha (127.0.0.1:27017).
 *
 * Uso (PowerShell):
 *   $env:ATLAS_URI='mongodb+srv://USUARIO:PASS@cluster.../taller?...'
 *   node scripts/migrate-local-to-atlas.js
 *
 * Opcional: LOCAL_URI (por defecto mongodb://127.0.0.1:27017/taller)
 */
const { MongoClient } = require("mongodb");

const LOCAL_URI = process.env.LOCAL_URI || "mongodb://127.0.0.1:27017/taller";
const ATLAS_URI = process.env.ATLAS_URI;
const DB_NAME = process.env.DB_NAME || "taller";

async function main() {
  if (!ATLAS_URI) {
    console.error("Falta ATLAS_URI. Ejemplo:");
    console.error('  $env:ATLAS_URI="mongodb+srv://..." ; node scripts/migrate-local-to-atlas.js');
    process.exit(1);
  }

  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  console.log("Conectando a local:", LOCAL_URI.replace(/:[^:@]+@/, ":****@"));
  await localClient.connect();
  console.log("Conectando a Atlas…");
  await atlasClient.connect();

  const localDb = localClient.db(DB_NAME);
  const atlasDb = atlasClient.db(DB_NAME);

  const collections = await localDb.listCollections().toArray();

  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;

    const src = localDb.collection(name);
    const n = await src.countDocuments();
    if (n === 0) {
      console.log(`[${name}] vacía, omitida`);
      continue;
    }

    const docs = await src.find({}).toArray();
    const dst = atlasDb.collection(name);
    await dst.deleteMany({});
    if (docs.length > 0) {
      await dst.insertMany(docs, { ordered: false });
    }
    console.log(`[${name}] ${docs.length} documentos copiados`);
  }

  await localClient.close();
  await atlasClient.close();
  console.log("Listo.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
