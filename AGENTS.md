# AGENTS.md — Полное руководство и правила разработки Pro Platform

> ⚠️ **ГЛАВНЫЙ ЗАКОН ДЛЯ ВСЕХ AI-АГЕНТОВ (Claude Code, Antigravity, Cursor, Gemini CLI и др.):**
>
> 1. **ОБЯЗАТЕЛЬНОЕ ПРОЧТЕНИЕ**: Каждый AI-агент обязан **целиком прочитать этот файл ДО начала работы** над любой задачей. Запрещено угадывать пути, названия файлов, роуты, стили или архитектурные паттерны — всё описано здесь.
> 2. **ОБЯЗАТЕЛЬНАЯ АКТУАЛИЗАЦИЯ**: При внесении **любых важных изменений** (новый эндпоинт, модель БД в Prisma, UI-компонент, страница, сервис, глобальный тип или изменение архитектуры) AI-агент **ОБЯЗАН сразу же зафиксировать эти изменения в этом файле (`AGENTS.md`)**. Этот документ — единый живой источник правды (Single Source of Truth) проекта.

---

## 1. О продукте и ключевых принципах

Pro Platform — самостоятельный быстрый task-менеджер для IT-команд и разработчиков (self-hosted продукт).

1. **Низкое потребление ресурсов** (CPU, RAM, диск) — проект должен летать на дешёвом VPS (1 vCPU, 512MB RAM) и ноутбуке.
2. **Единая дизайн-система**: **СТРОГО ЗАПРЕЩЕНО** использовать нативные HTML-теги `<button>`, `<input>`, `<textarea>`, `<dialog>` в компонентах страниц и фич. Всегда использовать готовые компоненты из `client/src/components/ui/`.
3. **Модульность**: Один домен = один файл роутов на API, одна папка в `components/<domain>/` на клиенте, свой сервис и store.
4. **Никаких догадок по путям**: структура проекта строго описана ниже.

---

## 2. Карта репозитория и структура папок

```
pro-platform/
├── package.json              # Корневые скрипты (install:all, run:all, build:all)
├── AGENTS.md                 # Настоящий файл — правила и архитектура
├── README.md                 # Публичная документация
│
├── api/                      # Backend (Fastify 5 + Prisma 6 + SQLite)
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma-модели (User, Organization, OrganizationMember, Task, Message)
│   │   ├── seed.ts           # Начальные тестовые данные
│   │   └── dev.db            # Файл SQLite БД
│   └── src/
│       ├── index.ts          # Точка входа, регистрация роутов Fastify с префиксом /api/<domain>
│       ├── lib/
│       │   ├── auth.ts       # authenticate() hook, getMembership(), JWT типы
│       │   └── prisma.ts     # Singleton PrismaClient
│       └── routes/
│           ├── auth.ts       # /api/auth (register, login, me)
│           ├── users.ts      # /api/users (список воркеров)
│           ├── organizations.ts # /api/organizations (CRUD, members)
│           ├── tasks.ts      # /api/tasks (CRUD, фильтрация)
│           └── messages.ts   # /api/tasks/:id/messages, /api/organizations/:id/chat, /api/messages/:id
│
└── client/                   # Frontend (React 19 + Vite 7 + Tailwind CSS v4)
    └── src/
        ├── App.tsx           # Корневой лейаут (AppSidebar + Header + Routes)
        ├── main.tsx          # Рендер React приложения
        ├── index.css         # Базовые стили, палитра CSS-переменных, скроллбары
        ├── components/
        │   ├── ui/           # БАЗОВЫЕ UI-КОМПОНЕНТЫ (ИСПОЛЬЗОВАТЬ ИХ ВМЕСТО HTML-ТЕГОВ):
        │   │   ├── button.tsx    # Button (варианты: primary, secondary, dark, ghost, danger, success, outline, sand)
        │   │   ├── input.tsx     # Input (текстовые поля)
        │   │   ├── textarea.tsx  # Textarea (многострочный ввод)
        │   │   ├── label.tsx     # Label (подписи полей на Radix UI)
        │   │   ├── dialog.tsx    # Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
        │   │   ├── select.tsx    # Select на Radix UI (Select, SelectTrigger, SelectContent, SelectItem)
        │   │   ├── badge.tsx     # Badge (default, secondary, destructive, success, warning, accent, outline)
        │   │   └── avatar.tsx    # Avatar, AvatarImage, AvatarFallback
        │   ├── sidebar/
        │   │   └── index.tsx     # AppSidebar — глобальный сайдбар навигации (сворачивание/раскрытие)
        │   ├── header/
        │   │   └── index.tsx     # Верхняя шапка (логотип, профиль, переключатель сайдбара, выход)
        │   ├── helper/           # Бизнес-хелперы и обертки
        │   │   ├── confirm-modal.tsx  # ConfirmModal (диалог подтверждения опасных действий)
        │   │   ├── field-input.tsx    # InputField (обертка для Formik поверх ui/input и ui/label)
        │   │   ├── message-list.tsx   # MessageList (общий список сообщений задачи и чата)
        │   │   ├── message-input.tsx  # MessageInput (инпут отправки сообщений)
        │   │   ├── task-stats.ts      # computeTaskStats() — расчёт процентов и метрик
        │   │   ├── container.tsx      # Container (ограничитель ширины)
        │   │   └── tokens.tsx         # getToken(), addToken(), removeToken()
        │   ├── dashboard/        # Компоненты дашборда (stat-cards.tsx, index.tsx)
        │   ├── tasks/            # Доска задач (column.tsx, items.tsx, sidebar.tsx, functions/*)
        │   ├── organization/     # Чат (chat/*), профиль орг, switcher, модалки
        │   ├── profile/          # Профиль пользователя
        │   └── auth/             # Формы login.tsx, register.tsx
        ├── page/                 # Тонкие route-обертки страниц
        ├── service/              # HTTP-сервисы Axios (auth, task, organization, message, chat)
        ├── store/                # Zustand-сторы (auth, task, message, chat)
        └── types/                # ЕДИНЫЙ ИСТОЧНИК ТИПОВ:
            ├── index.ts          # Реэкспорт всех типов
            ├── common.types.ts   # ITaskStats, IStatCardItem, OrgRole, TaskStatusValue, IBaseModalProps...
            ├── auth.types.ts     # IUser, ILogin, IRegister
            ├── task.types.ts     # ITaskResponce, ITaskRequest, TaskQueryParams
            ├── organization.types.ts # IOrganization, IOrganizationMember
            └── message.types.ts  # IMessage, MessageType, IMessageRequest
```

---

## 3. Стек технологий и версии

### Клиент (`client/`)
- **React 19** + **Vite 7** + **TypeScript (strict)**.
- **React Compiler** (`babel-plugin-react-compiler`) включён — **не писать ручные `useMemo`/`useCallback`**, компилятор оптимизирует их автоматически.
- **Tailwind CSS v4** — `@tailwindcss/vite`, переменные в `src/index.css`.
- **Radix UI** primitives: `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-avatar`, `@radix-ui/react-label`, `@radix-ui/react-slot`.
- **Вспомогательные утилиты стилей**: `clsx`, `tailwind-merge`, `class-variance-authority` (функция `cn()` в `src/lib/utils.ts`).
- **Zustand 5** — глобальные сторы без лишних middleware.
- **React Router 7**, **Axios**, **Formik + Yup**, **@dnd-kit**, **Lucide React**.

### Сервер (`api/`)
- **Fastify 5** — легковесный, быстрый, строгий фреймворк.
- **Prisma 6** + **SQLite** (`file:./dev.db`) — zero-config база данных.
- **@fastify/jwt** + **bcryptjs**.
- **Zod** — строгая валидация входящих тел запросов.
- **Swagger / OpenAPI** на `/docs`.

---

## 4. UI-компоненты: правила и использование

> ⚠️ **ЖЕЛЕЗНОЕ ПРАВИЛО:**
> Никогда не писать `<button className="...">`, `<input className="...">`, `<textarea ...>`, нативные модальные оверлеи.
> Всегда импортировать из `components/ui/`!

### 4.1 Кнопки (`Button`)
Импорт: `import { Button } from "@/components/ui/button";` (или относительный путь `../ui/button`).
Доступные варианты (`variant`):
- `primary`: Акцентная фиолетовая кнопка (`#BB86FC` текст `#121212`) — для главных действий (Создать, Сохранить, Войти).
- `secondary`: Бирюзовая кнопка (`#03DAC6` текст `#121212`).
- `dark`: Тёмная кнопка с бордером (`bg-[#252525] border-[#2C2C2C] hover:border-[#BB86FC]/50`).
- `ghost`: Прозрачная кнопка с подсветкой при наведении.
- `danger`: Розово-красная кнопка удаления/ошибки (`#CF6679`).
- `success`: Зеленая кнопка успеха (`#4CAF50`).
- `outline`: Прозрачная с фиолетовым бордером.

Размеры (`size`): `sm`, `md` (дефолт), `lg`, `xl`.

```tsx
// Пример:
<Button variant="primary" size="sm" onClick={handleSave}>
  Сохранить
</Button>
<Button variant="dark" size="sm" className="w-8 h-8 p-0 rounded-full">
  <Icon size={15} />
</Button>
```

### 4.2 Поля ввода (`Input`, `Textarea`, `Label`)
```tsx
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

<div className="space-y-1.5">
  <Label htmlFor="title">Название задачи</Label>
  <Input id="title" placeholder="Введите название..." value={title} onChange={...} />
</div>
```
Для форм Formik используется готовый компонент:
```tsx
import { InputField } from "../helper/field-input";
<InputField name="email" title="Email" type="email" />
```

### 4.3 Модальные окна (`Dialog`, `ConfirmModal`)
- Для простого подтверждения действия (удаление, выход):
  ```tsx
  import { ConfirmModal } from "../helper/confirm-modal";
  <ConfirmModal
    isOpen={open}
    title="Удалить задачу?"
    message="Действие необратимо"
    variant="danger"
    onConfirm={handleDelete}
    onClose={() => setOpen(false)}
  />
  ```
- Для кастомных форм: использовать `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` из `../ui/dialog`.

### 4.4 Бейджи и Аватары
```tsx
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

<Badge variant="default">Владелец</Badge>
<Badge variant="accent">В работе</Badge>

<Avatar className="w-8 h-8 ring-2 ring-[#BB86FC]">
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

---

## 5. Цветовая палитра проекта

Соблюдать HEX-коды темной темы (не изобретать свои случайные цвета):
- Фон страницы: `#121212` (`--bg-main`)
- Карточки и модалки: `#1E1E1E` (`--bg-surface`)
- Инпуты, плашки, ховеры: `#252525` (`--bg-overlay`)
- Границы (borders): `#2C2C2C` (`--border-light`)
- Главный акцент (фиолетовый): `#BB86FC` (`--brand-primary`)
- Вторичный акцент (бирюзовый): `#03DAC6` (`--brand-secondary`)
- Текст основной: `#E3E3E3` (`--text-primary`)
- Текст приглушенный: `#9E9E9E` (`--text-secondary`)
- Ошибки / Удаление: `#CF6679` (`--status-error`)
- Успех: `#4CAF50` (`--status-success`)
- Статусы колонок:
  - 0: Ожидает (`#757575`, серая точка)
  - 1: В работе (`#2196F3`, синяя точка)
  - 2: Готово (`#4CAF50`, зеленая точка)
  - 3: Отклонено (`#CF6679`, розовая точка)

---

## 6. Правила API и эндпоинты

Все эндпоинты сервера строго монтируются с префиксом `/api/<domain>`:
- `/api/auth` — `POST /register`, `POST /login`, `GET /me`
- `/api/users` — `GET /` (список воркеров платформы для назначения)
- `/api/organizations` — `GET /`, `POST /`, `GET /:id`, `GET /:id/members`, `POST /:id/members`, `DELETE /:id/members/:userId`
- `/api/tasks` — `GET /` (query: `organizationId`, `assigneeId`, `status`, `search`), `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/api/tasks/:taskId/messages` — комментарии к конкретной задаче
- `/api/organizations/:orgId/chat` — общий чат команды
- `/api/messages/:id` — удаление сообщения

**Правило проверки прав (5.3):**
Любой мутирующий роут (создание/изменение/удаление задачи, участника, сообщения) обязан проверить членство `request.user.id` в организации:
```ts
const membership = await getMembership(orgId, payload.id);
if (!membership) {
  return reply.status(403).send({ error: "Нет доступа к этой организации" });
}
```

---

## 7. Управление зависимостями и команды сборки

Корневой `package.json` содержит канонические скрипты:
- `npm run install:all` — установка зависимостей в корне, `client/` и `api/`.
- `npm run run:all` — одновременный запуск фронтенда (Vite 5173) и бэкенда (Fastify 3001) через `concurrently`.
- `npm run build:all` — одновременная сборка фронтенда (`tsc -b && vite build`) и бэкенда (`tsc`).
- `npm run db:seed` — запуск сида базы данных.
- `npm run db:studio` — веб-интерфейс Prisma Studio для просмотра БД.

Перед любым коммитом **ОБЯЗАТЕЛЬНО** проверить:
1. `cd client && npm run build` — сборка клиента без ошибок TS.
2. `cd api && npm run build` — сборка сервера без ошибок TS.

---

## 8. Типизация (`client/src/types/`)

Все типы строго выносить в папку `client/src/types/`:
- Не объявлять интерфейсы моделей в коде компонентов или сервисов.
- `types/index.ts` реэкспортирует всё:
  - `common.types.ts`: `ITaskStats`, `IStatCardItem`, `OrgRole`, `TaskStatusValue`, `TaskPriorityValue`, `IBaseModalProps`, `IInputField`.
  - `task.types.ts`: `ITaskResponce`, `ITaskRequest`, `TaskQueryParams`.
  - `organization.types.ts`: `IOrganization`, `IOrganizationMember`.
  - `auth.types.ts`: `IUser`, `ILogin`, `IRegister`.
  - `message.types.ts`: `IMessage`, `MessageType`, `IMessageRequest`.
- В компонентах импортировать: `import type { ITaskResponce, ITaskStats } from "../../types";`.

---

## 9. Чек-лист для AI-агентов перед завершением задачи

Перед тем как сообщить пользователю о готовности задачи, AI-агент **ОБЯЗАН** выполнить:
1. **Сборка без ошибок**:
   - `cd client && npm run build` (tsc -b && vite build) — 0 ошибок TS.
   - `cd api && npm run build` (tsc) — 0 ошибок TS.
2. **Дизайн-система**:
   - Проверить, что не добавлены нативные `<button>`, `<input>`, `<textarea>`, `<dialog>` — вместо них строго `components/ui/`.
3. **Безопасность API**:
   - Если создан мутирующий роут (POST/PATCH/DELETE) — добавлена проверка членства в организации через `getMembership()`.
4. **Актуализация AGENTS.md**:
   - Если добавлены новые страницы, UI-компоненты, эндпоинты, таблицы БД или типы — **внести их в карту репозитория и таблицы AGENTS.md прямо в текущей задаче**.
