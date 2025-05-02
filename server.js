// server.js
require("dotenv").config();
const fastify = require("fastify")();
const fastifyFormBody = require("@fastify/formbody");
const { Sequelize } = require("sequelize");
const database = require("./config/database.js");
const incomingCallController = require("./controllers/incomingCallController.js");

const PORT = process.env.PORT || 5050;

// Initialize Sequelize
const connection = database.development;
if (!connection) {
  console.error("Database connection details are missing");
  process.exit(1);
}

const db = new Sequelize(connection);

// Test DB connection and sync
(async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log("✅ Database connected and models synced");
  } catch (error) {
    console.error("❌ Database connection error:", error.stack || error);
    process.exit(1);
  }
})();

// Register middlewares
fastify.register(fastifyFormBody);

// Add logging
fastify.addHook("onRequest", (request, reply, done) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  done();
});

// Routes
fastify.post("/incoming-call", incomingCallController);
fastify.get("/incoming-call", (request, reply) => {
  reply.send({ message: "Welcome to the Twilio AI Assistant!" });
});

// Start server
fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server ready at ${address}`);
  console.log(`📞 Twilio webhook: ${address}/incoming-call`);
});
