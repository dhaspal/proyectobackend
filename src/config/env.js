function getEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === "") {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
  return value;
}

function getEnvOptional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === null || value === "" ? fallback : value;
}

module.exports = { getEnv, getEnvOptional };
