import http from "http";
import app from "./app.js";
import prisma from "./db/connection.js";
import { initializeSocket } from "./utils/socket.js";


const PORT = process.env.PORT || 3000;

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await testConnection();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io with the server
  const io = initializeSocket(server);

  
  // Use server.listen instead of app.listen
  server.listen(PORT, () => {
    console.log(`🚀 EVAdmin server running on port ${PORT}`);
    console.log(`🔌 Socket.io server initialized`);
  });
}

// Handle shutdown gracefully
const gracefulShutdown = async () => {
  console.log("🔌 Shutting down server...");
  await prisma.$disconnect();
  console.log("🛑 Database connection closed");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();