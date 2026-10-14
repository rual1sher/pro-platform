import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаем наполнение базы данных начальными данными...");

  // Очистка таблиц перед сидом
  await prisma.task.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // Создаем пользователей
  const alex = await prisma.user.create({
    data: {
      email: "admin@pro.dev",
      name: "Алексей Иванов",
      password: passwordHash,
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: "maria@pro.dev",
      name: "Мария Смирнова",
      password: passwordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
  });

  const dmitry = await prisma.user.create({
    data: {
      email: "dmitry@pro.dev",
      name: "Дмитрий Сидоров",
      password: passwordHash,
      role: "MEMBER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Пользователи созданы:", alex.email, maria.email, dmitry.email);

  // Создаем организации
  const org1 = await prisma.organization.create({
    data: {
      name: "Pro Platform Team",
      description: "Основная продуктовая команда разработки платформы",
      members: {
        create: [
          { userId: alex.id, role: "OWNER" },
          { userId: maria.id, role: "MEMBER" },
          { userId: dmitry.id, role: "MEMBER" },
        ],
      },
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: "Fintech Solutions",
      description: "Клиентский проект платежного шлюза",
      members: {
        create: [
          { userId: alex.id, role: "ADMIN" },
          { userId: dmitry.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✅ Организации созданы:", org1.name, org2.name);

  // Создаем задачи для Pro Platform Team
  const today = new Date().toLocaleDateString("ru-RU");

  await prisma.task.createMany({
    data: [
      {
        title: "Спроектировать REST API на Fastify и схему Prisma",
        description: "Подключить SQLite, спроектировать сущности User, Organization, Task",
        status: "2", // Готово
        priority: "2", // Высокий
        dueDate: today,
        organizationId: org1.id,
        assigneeId: dmitry.id,
        creatorId: alex.id,
      },
      {
        title: "Настроить JWT аутентификацию и регистрацию",
        description: "Реализовать эндпоинты /api/auth/register, /api/auth/login, /api/auth/me",
        status: "2", // Готово
        priority: "1", // Средний
        dueDate: today,
        organizationId: org1.id,
        assigneeId: dmitry.id,
        creatorId: alex.id,
      },
      {
        title: "Разработать селектор организаций и управление воркерами",
        description: "Интегрировать дропдаун организаций в хедер и карточки сотрудников",
        status: "1", // В работе
        priority: "2", // Высокий
        dueDate: "25.09.2026",
        organizationId: org1.id,
        assigneeId: maria.id,
        creatorId: alex.id,
      },
      {
        title: "Обновить Kanban доску с фильтрацией по сотрудникам",
        description: "Добавить фильтр по воркерам, быстрый поиск и отображение аватаров",
        status: "1", // В работе
        priority: "1", // Средний
        dueDate: "28.09.2026",
        organizationId: org1.id,
        assigneeId: maria.id,
        creatorId: alex.id,
      },
      {
        title: "Создать дашборд статистики и аналитики команды",
        description: "Подсчет завершенных задач, эффективности воркеров и нагрузки",
        status: "0", // Ожидает
        priority: "1", // Средний
        dueDate: "02.10.2026",
        organizationId: org1.id,
        assigneeId: alex.id,
        creatorId: alex.id,
      },
      {
        title: "Подключить Telegram-уведомления о дедлайнах",
        description: "Отправка уведомлений исполнителю за 24 часа до срока задачи",
        status: "0", // Ожидает
        priority: "0", // Низкий
        dueDate: "05.10.2026",
        organizationId: org1.id,
        assigneeId: dmitry.id,
        creatorId: alex.id,
      },
      {
        title: "Интеграция с legacy сервисом рассылок v0",
        description: "Задача отменена в связи с переходом на современную почтовую платформу",
        status: "3", // Отклонено
        priority: "0", // Низкий
        dueDate: "15.09.2026",
        organizationId: org1.id,
        assigneeId: alex.id,
        creatorId: alex.id,
      },
      // Задачи для Fintech Solutions
      {
        title: "Интеграция API платежного шлюза",
        description: "Подключение двухфакторной аутентификации 3D Secure 2.0",
        status: "1", // В работе
        priority: "2", // Высокий
        dueDate: "30.09.2026",
        organizationId: org2.id,
        assigneeId: dmitry.id,
        creatorId: alex.id,
      },
    ],
  });

  console.log("✅ Начальные задачи созданы!");
  console.log("\n🚀 Тестовые учетные записи:");
  console.log("  1) admin@pro.dev / password123 (Алексей Иванов — Владелец)");
  console.log("  2) maria@pro.dev / password123 (Мария Смирнова — Frontend)");
  console.log("  3) dmitry@pro.dev / password123 (Дмитрий Сидоров — Backend)");
}

main()
  .catch((e) => {
    console.error("❌ Ошибка при сиде данных:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
