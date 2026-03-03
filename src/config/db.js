const mongoose = require("mongoose");
const { getEnv } = require("./env");

async function connectDb() {
  const uri = getEnv("MONGO_URI");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
  });
  return mongoose.connection;
}

module.exports = { connectDb };
