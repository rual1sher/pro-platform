import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, getMembership, TokenPayload } from "../lib/auth.js";

const createMessageSchema = z.object({
  content: z.string().min(1, "Сообщение не может быть пустым").max(4000, "Слишком длинное сообщение"),
});

const authorSelect = {
  select: { id: true, name: true, email: true, avatar: true },
} as const;

function formatMessage(message: any) {
  return {
    id: message.id,
    content: message.content,
    type: message.type,
    taskId: message.taskId,
    organizationId: message.organizationId,
    authorId: message.authorId,
    author: message.author,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function messageRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // --- Task comments ---

  // List comments for a task
  fastify.get("/tasks/:taskId/messages", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const { taskId } = request.params as { taskId: string };
    const id = parseInt(taskId, 10);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const task = await prisma.task.findUnique({ where: { id }, select: { organizationId: true } });
    if (!task) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(task.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const messages = await prisma.message.findMany({
      where: { taskId: id, type: "TASK_COMMENT" },
      include: { author: authorSelect },
      orderBy: { createdAt: "asc" },
    });

    return reply.send(messages.map(formatMessage));
  });

  // Add a comment to a task
  fastify.post("/tasks/:taskId/messages", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const { taskId } = request.params as { taskId: string };
    const id = parseInt(taskId, 10);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const parse = createMessageSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const task = await prisma.task.findUnique({ where: { id }, select: { organizationId: true } });
    if (!task) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(task.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const message = await prisma.message.create({
      data: {
        content: parse.data.content,
        type: "TASK_COMMENT",
        taskId: id,
        authorId: payload.id,
      },
      include: { author: authorSelect },
    });

    return reply.status(201).send(formatMessage(message));
  });

  // --- Organization chat ---

  // List recent org chat messages (last 200)
  fastify.get("/organizations/:orgId/chat", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const { orgId } = request.params as { orgId: string };
    const id = parseInt(orgId, 10);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "Некорректный ID организации" });
    }

    const membership = await getMembership(id, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const messages = await prisma.message.findMany({
      where: { organizationId: id, type: "ORG_CHAT" },
      include: { author: authorSelect },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return reply.send(messages.reverse().map(formatMessage));
  });

  // Send an org chat message
  fastify.post("/organizations/:orgId/chat", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const { orgId } = request.params as { orgId: string };
    const id = parseInt(orgId, 10);
    if (isNaN(id)) {
      return reply.status(400).send({ error: "Некорректный ID организации" });
    }

    const parse = createMessageSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const membership = await getMembership(id, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const message = await prisma.message.create({
      data: {
        content: parse.data.content,
        type: "ORG_CHAT",
        organizationId: id,
        authorId: payload.id,
      },
      include: { author: authorSelect },
    });

    return reply.status(201).send(formatMessage(message));
  });

  // --- Shared delete ---

  fastify.delete("/messages/:id", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const { id } = request.params as { id: string };
    const messageId = parseInt(id, 10);
    if (isNaN(messageId)) {
      return reply.status(400).send({ error: "Некорректный ID сообщения" });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { task: { select: { organizationId: true } } },
    });

    if (!message) {
      return reply.status(404).send({ error: "Сообщение не найдено" });
    }

    const organizationId = message.organizationId ?? message.task?.organizationId;
    if (!organizationId) {
      return reply.status(500).send({ error: "Сообщение не привязано к организации" });
    }

    const membership = await getMembership(organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const canDelete = message.authorId === payload.id || membership.role === "OWNER" || membership.role === "ADMIN";
    if (!canDelete) {
      return reply.status(403).send({ error: "Можно удалять только свои сообщения" });
    }

    await prisma.message.delete({ where: { id: messageId } });

    return reply.send({ success: true, message: "Сообщение удалено" });
  });
}
