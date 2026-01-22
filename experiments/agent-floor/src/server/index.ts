import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { FloorRoom } from "./rooms/FloorRoom";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

// Register rooms
gameServer.define("floor", FloorRoom);

// Start server
const PORT = Number(process.env.COLYSEUS_PORT) || 2567;

gameServer.listen(PORT).then(() => {
  console.log(`🏢 AgentFloor server running on ws://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  gameServer.gracefullyShutdown();
  process.exit(0);
});
