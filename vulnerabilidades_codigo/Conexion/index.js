require("dotenv").config();

const { createApp } = require("./app");
const { connectDb } = require("./config/db");

async function main() {
  await connectDb();
  const app = createApp();
  const port = Number(process.env.PORT || 4000);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API escuchando en http://localhost:${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fallo al iniciar:", err);
  process.exit(1);
});

