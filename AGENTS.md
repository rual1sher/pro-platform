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
5. **НИКАКИХ ХАРДКОДНЫХ ЦВЕТОВ (1-клик смена тем)**: **СТРОГО ЗАПРЕЩЕНО** писать хардкодные HEX-цвета (`bg-[#...]`, `text-[#...]`, `border-[#...]`) внутри компонентов и страниц. Все цвета обязаны задаваться исключительно через CSS-переменные (`var(--bg-main)`, `var(--brand-primary)`, `var(--text-secondary)`, `var(--border-light)` и др.) или классы темы `@theme` из `client/src/index.css`. Вся тема приложения должна меняться в **один клик** редактированием `:root` в `client/src/index.css`.
6. **ЗАПРЕТ ШАБЛОННОСТИ И ДУБЛИРОВАНИЯ (Product Craft & No AI Boilerplate)**:
   - **Никакого дублирования**: СТРОГО ЗАПРЕЩЕНО дублировать одни и те же сущности и метрики на одном экране (например, рендерить 4 счётчика задач сначала отдельными карточками, а затем под ними повторять те же самые 4 счётчика полосками; дублировать крупный логотип и название платформы одновременно в шапке и в сайдбаре).
   - **Фокус на человеке (Actionable UX)**: Страницы и дашборды обязаны строиться вокруг реальной работы пользователя («Мой фокус на сегодня», «Мои задачи», «Свежие обновления в команде»), а не вокруг сухих бессмысленных цифр-заглушек.
   - **Информационная плотность и чистота (Linear / Raycast Style)**: Никаких кричащих огромных цветных плашек «★ Важная» или мультяшных пузырей со скруглениями 30px+. Использовать лаконичные статусные глифы (кружки, спиннеры, галочки), дискретные индикаторы приоритета и компактные строки с высокой читаемостью.
   - **Клавиатурные шорткаты и быстрые действия**: Создание задач, переход по разделам и поиск должны быть доступны в один клик или по горячим клавишам без лишних диалоговых тупиков.

---

## 2. Карта репозитория и структура папок

```
pro-platform/
├── package.json              # Корневые скрипты (install:all, dev:all, build:all, format)
├── .prettierrc               # Глобальная конфигурация Prettier
├── .prettierignore           # Исключения для Prettier
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
        │   │   ├── index.tsx     # Верхняя шапка (логотип, профиль, переключатель сайдбара)
        │   │   └── functions/    # logout.tsx
        │   ├── helper/           # Бизнес-хелперы и обертки
        │   │   ├── animations.tsx     # Framer-like CSS/Tailwind утилиты анимаций
        │   │   ├── auth-loading.tsx   # Индикатор загрузки авторизации
        │   │   ├── confirm-modal.tsx  # ConfirmModal (диалог подтверждения опасных действий)
        │   │   ├── container.tsx      # Container (ограничитель ширины)
        │   │   ├── field-input.tsx    # InputField (обертка для Formik поверх ui/input и ui/label)
        │   │   ├── message-input.tsx  # MessageInput (инпут отправки сообщений)
        │   │   ├── message-list.tsx   # MessageList (общий список сообщений задачи и чата)
        │   │   ├── task-stats.ts      # computeTaskStats() — расчёт процентов и метрик
        │   │   ├── tokens.tsx         # getToken(), addToken(), removeToken()
        │   │   ├── use-auth-guard.ts  # Хук защиты роутов от неавторизованного доступа
        │   │   └── use-bootstrap-auth.ts # Хук начальной инициализации сессии пользователя
        │   ├── dashboard/        # Компоненты дашборда (stat-cards.tsx — WorkloadOverview, index.tsx)
        │   ├── tasks/            # Доска задач (column.tsx, items.tsx, sidebar.tsx, detail-page.tsx, functions/*)
        │   ├── organization/     # Чат (chat/*), профиль орг (profile/*), switcher, модалки
        │   ├── profile/          # Профиль пользователя
        │   ├── home/             # Публичный лендинг (main.tsx)
        │   ├── not-found/        # 404 страница (not-found.tsx)
        │   └── auth/             # Формы login.tsx, register.tsx
        ├── page/                 # Тонкие route-обертки страниц (auth, chat, dashboard, home, organization, profile, tasks)
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

- `primary`: Акцентная тёплая кнопка песочного золота / шампань (`bg-[var(--brand-primary)] text-[var(--bg-main)]`) — для главных фокусных действий (Создать, Сохранить, Войти).
- `secondary`: Мягкая нейтрально-песочная кнопка (`bg-[var(--brand-secondary)] text-[var(--bg-main)]`).
- `dark`: Тёмная поверхность с бордером (`bg-[var(--bg-overlay)] border-[var(--border-light)] hover:border-[var(--brand-primary)]/50`).
- `ghost`: Прозрачная кнопка с подсветкой при наведении.
- `danger`: Мягкая коралловая кнопка ошибки/удаления (`text-[var(--status-error)]`).
- `success`: Шалфейная кнопка успеха (`text-[var(--status-success)]`).
- `outline`: Прозрачная с тёплым песочным бордером (`border-[var(--brand-primary)] text-[var(--brand-primary)]`).

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
<InputField name="email" title="Email" type="email" />;
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
  />;
  ```
- Для кастомных форм: использовать `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` из `../ui/dialog`.

### 4.4 Бейджи и Аватары

```tsx
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

<Badge variant="default">Владелец</Badge>
<Badge variant="accent">В работе</Badge>

<Avatar className="w-8 h-8 ring-2 ring-[var(--brand-primary)]">
  <AvatarImage src={user.avatar} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

---

## 5. Цветовая палитра и централизованная система токенов

Все цвета проекта определены в `:root` файла `client/src/index.css`.
В компонентах **СТРОГО ЗАПРЕЩЕНО** хардкодить цвета. Используются только CSS-переменные (`var(--...)`) или сгенерированные Tailwind `@theme` классы.

### 5.1 Основная тема: Neutral Warm Dark (Нейтрально-тёплая тёмная тема: нейтральный графит, шампань и мягкий шалфей)

| Назначение                     | Токен CSS               | Значение по умолчанию | Описание                                                                 |
| :----------------------------- | :---------------------- | :-------------------- | :----------------------------------------------------------------------- |
| **Фон страницы**               | `--bg-main`             | `#131417`             | Сбалансированный нейтральный графитовый фон с деликатным тёплым подтоном |
| **Поверхности**                | `--bg-surface`          | `#1b1c21`             | Карточки задач, модалки, сайдбар, шапка                                  |
| **Инпуты / Плашки**            | `--bg-overlay`          | `#25272e`             | Поля ввода, кнопки dark, фоны выпадающих списков                         |
| **Основной текст**             | `--text-primary`        | `#f4f4f6`             | Чистый нейтральный мягкий белый (высокая читаемость, комфорт для глаз)   |
| **Вторичный текст**            | `--text-secondary`      | `#9da1ad`             | Спокойный серо-песочный для дат, подписей и иконок                       |
| **Приглушенный текст**         | `--text-disabled`       | `#5d6170`             | Плейсхолдеры и неактивные элементы                                       |
| **Главный акцент (CTA)**       | `--brand-primary`       | `#e2b17a`             | Мягкое песочное золото / шампань (главные кнопки, активные пункты меню)  |
| **Ховер главного акцента**     | `--brand-primary-hover` | `#d59f63`             | Насыщенный оттенок шампань при наведении                                 |
| **Второй акцент**              | `--brand-secondary`     | `#c29d78`             | Мягкий тёплый песочно-верблюжий (camel)                                  |
| **Мятный / Шалфей**            | `--brand-mint`          | `#8ec390`             | Спокойный мягкий шалфейный зеленый                                       |
| **Коралловый акцент**          | `--brand-pink`          | `#e89e92`             | Мягкий персиково-коралловый                                              |
| **Границы (borders)**          | `--border-light`        | `#282a33`             | Тонкие деликатные границы                                                |
| **Фокус границы**              | `--border-focus`        | `#e2b17a`             | Подсветка фокуса в тоне шампань                                          |
| **Статус: Успех**              | `--status-success`      | `#8ec390`             | Мягкий шалфейный зеленый (колонка "Готово", успех)                       |
| **Статус: Внимание**           | `--status-warning`      | `#eab467`             | Спокойный медовый янтарь                                                 |
| **Статус: Ошибка / Отклонено** | `--status-error`        | `#e57870`             | Мягкий тёплый коралловый (удаление, ошибки)                              |
| **Статус: Инфо / В работе**    | `--status-info`         | `#7daec9`             | Мягкий серо-голубой (колонка "В работе")                                 |

### 5.2 Статусы задач (колонки канбана)

- **0: Ожидает** — точка `var(--text-secondary)`, бейдж `var(--text-secondary)`
- **1: В работе** — точка `var(--status-info)`, бейдж `var(--status-info)`
- **2: Готово** — точка `var(--status-success)`, бейдж `var(--status-success)`
- **3: Отклонено** — точка `var(--status-error)`, бейдж `var(--status-error)`

### 5.3 Приоритеты задач

- **Низкий (1)**: `var(--status-success)` (`#8ec390`)
- **Средний (2)**: `var(--status-warning)` (`#eab467`)
- **Высокий (3)**: `var(--status-error)` (`#e57870`)

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
- `npm run format` — глобальное форматирование всего проекта через Prettier (`prettier --write .`).
- `npm run format:check` — проверка форматирования кода во всем проекте.
- `npm run db:seed` — запуск сида базы данных.
- `npm run db:studio` — веб-интерфейс Prisma Studio для просмотра БД.

Перед любым коммитом **ОБЯЗАТЕЛЬНО** проверить:

1. `npm run format:check` (или `npm run format`) — форматирование соответствует `.prettierrc`.
2. `cd client && npm run build` — сборка клиента без ошибок TS.
3. `cd api && npm run build` — сборка сервера без ошибок TS.

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
5. **Отсутствие хардкодных цветов**:
   - Проверить, что в компонентах и стилях страниц нет сырых HEX-кодов вида `#[0-9a-fA-F]{3,6}` — все цвета строго через CSS-переменные (`var(--...)`) или классы темы.
6. **Отсутствие AI-шаблонности и дублирования (Product Craft)**:
   - Проверить, что на экране нет дублирующихся метрик или одинаковых заголовков в разных местах.
   - Проверить, что UX ориентирован на реальную работу команды (информационная плотность, читаемость, шорткаты, отсутствие пустых 4-блочных шаблонов-заглушек).
