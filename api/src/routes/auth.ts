import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, TokenPayload } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post("/register", async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Ошибка валидации",
        details: parseResult.error.errors,
      });
    }

    const { email, name, password } = parseResult.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return reply.status(400).send({
        error: "Пользователь с таким email уже существует",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and initial organization
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Create default organization for new user
    const defaultOrg = await prisma.organization.create({
      data: {
        name: `Команда ${name}`,
        description: "Основное рабочее пространство",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
    } as TokenPayload);

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
      defaultOrgId: defaultOrg.id,
    });
  });

  // Login
  fastify.post("/login", async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Ошибка валидации",
        details: parseResult.error.errors,
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(401).send({
        error: "Неверный email или пароль",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({
        error: "Неверный email или пароль",
      });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
    } as TokenPayload);

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        description: m.organization.description,
        role: m.role,
      })),
    });
  });

  // Current user info
  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    const payload = request.user as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "Пользователь не найден" });
    }

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        description: m.organization.description,
        role: m.role,
      })),
    });
  });
}
