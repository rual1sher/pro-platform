import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { authRoutes } from "./routes/auth.js";
import { organizationRoutes } from "./routes/organizations.js";
import { taskRoutes } from "./routes/tasks.js";
import { messageRoutes } from "./routes/messages.js";

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

// Register JWT
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "super-secret-key-pro-platform-2026",
});

// Register Swagger Documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Pro Platform API",
      description: "API для управления организациями, сотрудниками (воркерами) и задачами",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Локальный сервер разработки",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

await fastify.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

// Health check
fastify.get("/api/health", async () => {
  return { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() };
});

// Register API Routes
await fastify.register(authRoutes, { prefix: "/api" });
await fastify.register(authRoutes, { prefix: "/api/auth" });
await fastify.register(organizationRoutes, { prefix: "/api/organizations" });
await fastify.register(taskRoutes, { prefix: "/api/tasks" });
await fastify.register(messageRoutes, { prefix: "/api" });

// Backwards compatibility aliases for root level endpoints
await fastify.register(authRoutes);
await fastify.register(authRoutes, { prefix: "/auth" });
await fastify.register(taskRoutes, { prefix: "/tasks" });
await fastify.register(organizationRoutes, { prefix: "/organizations" });

// Global Error Handler
fastify.setErrorHandler((error: any, request, reply) => {
  fastify.log.error(error);
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: error.name || "Internal Server Error",
    message: error.message || "Произошла непредвиденная ошибка на сервере",
    statusCode,
  });
});

// Start Server
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`\n🚀 Сервер Fastify успешно запущен: http://localhost:${PORT}`);
  console.log(`📚 Swagger документация доступна: http://localhost:${PORT}/docs\n`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
