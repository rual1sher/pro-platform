import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "./prisma.js";

export interface TokenPayload {
  id: number;
  email: string;
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: "Не авторизован", message: "Токен недействителен или отсутствует" });
  }
}

// Returns the caller's membership row for an organization, or null if they don't belong to it.
export async function getMembership(organizationId: number, userId: number) {
  return prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
}
