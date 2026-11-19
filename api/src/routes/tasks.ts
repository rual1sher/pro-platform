import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, TokenPayload } from "../lib/auth.js";

const createTaskSchema = z.object({
  title: z.string().min(1, "Укажите название задачи"),
  description: z.string().optional(),
  order: z.string().optional(),
  status: z.string().optional(),
  preority: z.any().optional(),
  priority: z.any().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  organizationId: z.number().optional(),
  user_id: z.number().optional(),
  assigneeId: z.number().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.string().optional(),
  status: z.string().optional(),
  preority: z.any().optional(),
  priority: z.any().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  user_id: z.number().nullable().optional(),
  assigneeId: z.number().nullable().optional(),
});

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // Format task for frontend compatibility
  const formatTask = (task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    order: task.status, // "0", "1", "2", "3"
    status: task.status,
    preority: task.priority, // "0", "1", "2"
    priority: task.priority,
    date: task.dueDate || new Date(task.createdAt).toLocaleDateString("ru-RU"),
    dueDate: task.dueDate || new Date(task.createdAt).toLocaleDateString("ru-RU"),
    user_id: task.assigneeId,
    assigneeId: task.assigneeId,
    organizationId: task.organizationId,
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          avatar: task.assignee.avatar,
        }
      : null,
    creator: task.creator
      ? {
          id: task.creator.id,
          name: task.creator.name,
          email: task.creator.email,
        }
      : null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });

  // Get tasks (supports filters: organizationId, user_id, status, search)
  fastify.get("/", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const query = request.query as {
      organizationId?: string;
      user_id?: string;
      assigneeId?: string;
      status?: string;
      order?: string;
      search?: string;
    };

    let targetOrgId: number | undefined;

    if (query.organizationId) {
      targetOrgId = parseInt(query.organizationId, 10);
    } else {
      // Find first organization the user is part of
      const firstMembership = await prisma.organizationMember.findFirst({
        where: { userId: payload.id },
        select: { organizationId: true },
        orderBy: { createdAt: "asc" },
      });
      targetOrgId = firstMembership?.organizationId;
    }

    if (!targetOrgId) {
      return reply.send([]);
    }

    const where: any = {
      organizationId: targetOrgId,
    };

    const targetUserId = query.assigneeId || query.user_id;
    if (targetUserId) {
      where.assigneeId = parseInt(targetUserId, 10);
    }

    const targetStatus = query.order || query.status;
    if (targetStatus !== undefined && targetStatus !== "") {
      where.status = String(targetStatus);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(tasks.map(formatTask));
  });

  // Create task
  fastify.post("/", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const parse = createTaskSchema.safeParse(request.body);

    if (!parse.success) {
      return reply.status(400).send({
        error: "Ошибка валидации",
        details: parse.error.errors,
      });
    }

    const data = parse.data;

    let orgId = data.organizationId;
    if (!orgId) {
      const firstMembership = await prisma.organizationMember.findFirst({
        where: { userId: payload.id },
        select: { organizationId: true },
      });
      orgId = firstMembership?.organizationId;
    }

    if (!orgId) {
      return reply.status(400).send({ error: "Не указана организация для задачи" });
    }

    const assigneeId = data.assigneeId || data.user_id || payload.id;
    const status = String(data.order ?? data.status ?? "0");
    const priority = String(data.preority ?? data.priority ?? "1");
    const dueDate = data.dueDate || data.date || new Date().toLocaleDateString("ru-RU");

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || "",
        status,
        priority,
        dueDate,
        organizationId: orgId,
        assigneeId,
        creatorId: payload.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return reply.status(201).send(formatTask(task));
  });

  // Get task by id
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    return reply.send(formatTask(task));
  });

  // Update task
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const parse = updateTaskSchema.safeParse(request.body);
    if (!parse.success) {
      return reply
        .status(400)
        .send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const data = parse.data;
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.status = String(data.order);
    if (data.status !== undefined) updateData.status = String(data.status);
    if (data.preority !== undefined) updateData.priority = String(data.preority);
    if (data.priority !== undefined) updateData.priority = String(data.priority);
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.date !== undefined) updateData.dueDate = data.date;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.user_id !== undefined) updateData.assigneeId = data.user_id;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return reply.send(formatTask(task));
  });

  // Delete task
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return reply.send({ success: true, message: "Задача удалена" });
  });
}
