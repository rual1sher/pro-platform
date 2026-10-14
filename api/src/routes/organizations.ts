import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, TokenPayload } from "../lib/auth.js";

const createOrgSchema = z.object({
  name: z.string().min(2, "Название минимум 2 символа"),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  userId: z.number().optional(),
  email: z.string().email().optional(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function organizationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // List all organizations user belongs to
  fastify.get("/", async (request, reply) => {
    const payload = request.user as TokenPayload;

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: payload.id },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(
      memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        description: m.organization.description,
        role: m.role,
        memberCount: m.organization._count.members,
        taskCount: m.organization._count.tasks,
        createdAt: m.organization.createdAt,
      }))
    );
  });

  // Create organization
  fastify.post("/", async (request, reply) => {
    const payload = request.user as TokenPayload;
    const parse = createOrgSchema.safeParse(request.body);

    if (!parse.success) {
      return reply.status(400).send({
        error: "Ошибка валидации",
        details: parse.error.errors,
      });
    }

    const { name, description } = parse.data;

    const org = await prisma.organization.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: payload.id,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    return reply.status(201).send(org);
  });

  // Get specific organization details
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return reply.status(400).send({ error: "Некорректный ID организации" });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!org) {
      return reply.status(404).send({ error: "Организация не найдена" });
    }

    return reply.send(org);
  });

  // List members of organization
  fastify.get("/:id/members", async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return reply.status(400).send({ error: "Некорректный ID организации" });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
    });

    return reply.send(
      members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.createdAt,
      }))
    );
  });

  // Add member to organization
  fastify.post("/:id/members", async (request, reply) => {
    const { id } = request.params as { id: string };
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return reply.status(400).send({ error: "Некорректный ID организации" });
    }

    const parse = addMemberSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: "Ошибка валидации", details: parse.error.errors });
    }

    const { userId, email, role } = parse.data;

    let targetUserId = userId;

    if (!targetUserId && email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return reply.status(404).send({ error: "Пользователь с таким email не найден" });
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return reply.status(400).send({ error: "Укажите userId или email" });
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      return reply.status(400).send({ error: "Пользователь уже состоит в этой организации" });
    }

    const newMember = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: targetUserId,
        role: role || "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return reply.status(201).send({
      id: newMember.id,
      userId: newMember.user.id,
      name: newMember.user.name,
      email: newMember.user.email,
      avatar: newMember.user.avatar,
      role: newMember.role,
      joinedAt: newMember.createdAt,
    });
  });

  // Remove member from organization
  fastify.delete("/:id/members/:userId", async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string };
    const orgId = parseInt(id, 10);
    const targetUserId = parseInt(userId, 10);

    if (isNaN(orgId) || isNaN(targetUserId)) {
      return reply.status(400).send({ error: "Некорректные параметры" });
    }

    // Check count of members
    const count = await prisma.organizationMember.count({
      where: { organizationId: orgId },
    });

    if (count <= 1) {
      return reply.status(400).send({ error: "Нельзя удалить единственного участника организации" });
    }

    await prisma.organizationMember.deleteMany({
      where: {
        organizationId: orgId,
        userId: targetUserId,
      },
    });

    return reply.send({ success: true, message: "Участник удален" });
  });
}
