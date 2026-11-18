import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // List all users (workers)
  fastify.get("/", async (_request, reply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return reply.send(users);
  });
}

