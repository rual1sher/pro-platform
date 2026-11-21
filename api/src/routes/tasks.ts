import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, getMembership, TokenPayload } from "../lib/auth.js";

const createTaskSchema = z.object({
  title: z.string().min(1, "Укажите название задачи"),
  description: z.string().optional(),
  order: z.string().optional(),
  status: z.string().optional(),
  position: z.number().optional(),
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
  position: z.number().optional(),
  preority: z.any().optional(),
  priority: z.any().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  user_id: z.number().nullable().optional(),
  assigneeId: z.number().nullable().optional(),
});

const updateTaskStatusSchema = z.object({
  status: z.string().min(1, "Укажите статус задачи"),
  position: z.number().optional(),
});

const reorderTaskSchema = z.object({
  position: z.number().min(0, "Позиция не может быть отрицательной"),
  status: z.string().optional(),
});

const bulkReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      position: z.number(),
      status: z.string().optional(),
    }),
  ),
});

export async function taskRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  const taskInclude = {
    assignee: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    creator: {
      select: { id: true, name: true, email: true },
    },
  } as const;

  type FormattableTask = Prisma.TaskGetPayload<{
    include: typeof taskInclude;
  }>;

  // Format task for frontend compatibility
  const formatTask = (task: FormattableTask) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    order: task.status, // "0", "1", "2", "3" (совместимость)
    status: task.status,
    position: task.position ?? 0,
    preority: task.priority, // "0", "1", "2"
    priority: task.priority,
    date: task.dueDate || new Date(task.createdAt).toLocaleDateString("ru-RU"),
    dueDate: task.dueDate || new Date(task.createdAt).toLocaleDateString("ru-RU"),
    user_id: task.assigneeId,
    assigneeId: task.assigneeId,
    organizationId: task.organizationId,
    creatorId: task.creatorId,
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

    const where: Prisma.TaskWhereInput = {
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
      include: taskInclude,
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    });

    return reply.send(tasks.map(formatTask));
  });

  // Create task (любой участник организации может создать задачу для кого угодно внутри команды)
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
      });
      orgId = firstMembership?.organizationId;
    }

    if (!orgId) {
      return reply.status(400).send({
        error: "Необходимо указать организацию",
      });
    }

    const membership = await getMembership(orgId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const targetStatus = String(data.status || data.order || "0");

    // Вычисляем следующую позицию внутри этой колонки статуса
    let targetPosition = data.position;
    if (targetPosition === undefined) {
      const maxPos = await prisma.task.findFirst({
        where: { organizationId: orgId, status: targetStatus },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      targetPosition = (maxPos?.position ?? 0) + 1;
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: targetStatus,
        priority: String(data.priority || data.preority || "1"),
        position: targetPosition,
        dueDate: data.dueDate || data.date,
        organizationId: orgId,
        assigneeId: data.assigneeId || data.user_id,
        creatorId: payload.id,
      },
      include: taskInclude,
    });

    return reply.status(201).send(formatTask(task));
  });

  // Bulk reorder tasks within section
  fastify.patch("/reorder", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const parse = bulkReorderSchema.safeParse(request.body);

    if (!parse.success) {
      return reply
        .status(400)
        .send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const { items } = parse.data;
    if (items.length === 0) return reply.send({ success: true });

    for (const item of items) {
      const task = await prisma.task.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          organizationId: true,
          creatorId: true,
          assigneeId: true,
          status: true,
        },
      });
      if (!task) continue;

      const membership = await getMembership(task.organizationId, payload.id);
      if (!membership) continue;

      const isOwner =
        membership.role === "OWNER" ||
        membership.role === "ADMIN" ||
        task.creatorId === payload.id;
      const isAssignee = task.assigneeId === payload.id;

      // Если в запросе передается смена статуса — только владелец, админ или исполнитель
      if (item.status && item.status !== task.status && !isOwner && !isAssignee) {
        return reply.status(403).send({
          error: "Доступ запрещен",
          message: `Сотрудник не имеет права менять статус чужой задачи #${item.id}`,
        });
      }

      await prisma.task.update({
        where: { id: item.id },
        data: {
          position: item.position,
          ...(item.status ? { status: item.status } : {}),
        },
      });
    }

    return reply.send({ success: true, message: "Порядок задач успешно обновлен" });
  });

  // Get task by id
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);
    const payload = request.user as TokenPayload;

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude,
    });

    if (!task) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(task.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    return reply.send(formatTask(task));
  });

  // Dedicated endpoint: Change task status (получатель задания или владелец)
  fastify.patch("/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);
    const payload = request.user as TokenPayload;

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const parse = updateTaskStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply
        .status(400)
        .send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        organizationId: true,
        creatorId: true,
        assigneeId: true,
        status: true,
        position: true,
      },
    });

    if (!existingTask) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(existingTask.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const isOwner =
      membership.role === "OWNER" ||
      membership.role === "ADMIN" ||
      existingTask.creatorId === payload.id;
    const isAssignee = existingTask.assigneeId === payload.id;

    if (!isOwner && !isAssignee) {
      return reply.status(403).send({
        error: "Доступ запрещен",
        message:
          "Сотрудник может изменять статус только назначенных ему задач. Только владелец может менять статус любых задач команды.",
      });
    }

    const newStatus = parse.data.status;
    let newPosition = parse.data.position;

    // Если статус сменился и новая позиция не передана явно, ставим задачу в конец целевой колонки
    if (newPosition === undefined && newStatus !== existingTask.status) {
      const maxPos = await prisma.task.findFirst({
        where: { organizationId: existingTask.organizationId, status: newStatus },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      newPosition = (maxPos?.position ?? 0) + 1;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        ...(newPosition !== undefined ? { position: newPosition } : {}),
      },
      include: taskInclude,
    });

    return reply.send(formatTask(updatedTask));
  });

  // Dedicated endpoint: Reorder task position (получатель задания или владелец)
  fastify.patch("/:id/reorder", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);
    const payload = request.user as TokenPayload;

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const parse = reorderTaskSchema.safeParse(request.body);
    if (!parse.success) {
      return reply
        .status(400)
        .send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        organizationId: true,
        creatorId: true,
        assigneeId: true,
        status: true,
        position: true,
      },
    });

    if (!existingTask) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(existingTask.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const isOwner =
      membership.role === "OWNER" ||
      membership.role === "ADMIN" ||
      existingTask.creatorId === payload.id;
    const isAssignee = existingTask.assigneeId === payload.id;

    if (!isOwner && !isAssignee) {
      return reply.status(403).send({
        error: "Доступ запрещен",
        message: "Сотрудник может перемещать только назначенные ему задачи.",
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        position: parse.data.position,
        ...(parse.data.status ? { status: parse.data.status } : {}),
      },
      include: taskInclude,
    });

    return reply.send(formatTask(updatedTask));
  });

  // Full task edit (Только Владелец/Админ организации или Создатель задачи)
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);
    const payload = request.user as TokenPayload;

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, organizationId: true, creatorId: true, assigneeId: true },
    });

    if (!existingTask) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(existingTask.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const isOwner =
      membership.role === "OWNER" ||
      membership.role === "ADMIN" ||
      existingTask.creatorId === payload.id;

    if (!isOwner) {
      return reply.status(403).send({
        error: "Доступ запрещен",
        message:
          "Только владелец или создатель задачи может редактировать её параметры (название, описание, приоритет, исполнитель). Для смены статуса используйте специальный статус-роут.",
      });
    }

    const parse = updateTaskSchema.safeParse(request.body);
    if (!parse.success) {
      return reply
        .status(400)
        .send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const data = parse.data;
    const updateData: Prisma.TaskUncheckedUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.status = String(data.order);
    if (data.status !== undefined) updateData.status = String(data.status);
    if (data.position !== undefined) updateData.position = data.position;
    if (data.preority !== undefined) updateData.priority = String(data.preority);
    if (data.priority !== undefined) updateData.priority = String(data.priority);
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.date !== undefined) updateData.dueDate = data.date;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.user_id !== undefined) updateData.assigneeId = data.user_id;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: taskInclude,
    });

    return reply.send(formatTask(task));
  });

  // Delete task (Только Владелец/Админ организации или Создатель задачи)
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const taskId = parseInt(id, 10);
    const payload = request.user as TokenPayload;

    if (isNaN(taskId)) {
      return reply.status(400).send({ error: "Некорректный ID задачи" });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, organizationId: true, creatorId: true },
    });

    if (!existingTask) {
      return reply.status(404).send({ error: "Задача не найдена" });
    }

    const membership = await getMembership(existingTask.organizationId, payload.id);
    if (!membership) {
      return reply.status(403).send({ error: "Нет доступа к этой организации" });
    }

    const isOwner =
      membership.role === "OWNER" ||
      membership.role === "ADMIN" ||
      existingTask.creatorId === payload.id;

    if (!isOwner) {
      return reply.status(403).send({
        error: "Доступ запрещен",
        message: "Только владелец организации или создатель задачи может удалить её",
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return reply.send({ success: true, message: "Задача удалена" });
  });
}
