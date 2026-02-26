# Project Roadmap

> AI-powered YouTube idea generator — миграция с React SPA на fullstack Vue 3 + Quasar + Hono + PostgreSQL

## Milestones

- [x] **Project Setup & Architecture Planning** — AI Factory context, DESCRIPTION.md, ARCHITECTURE.md, AGENTS.md, docs, Makefile, CI
- [x] **Git Repository & Monorepo Workspace** — git init, npm workspaces (client/, server/, shared/), root tsconfig
- [x] **Backend Foundation (Hono + Domain)** — server/ scaffold, Hono app, domain entities, ports (IAiService, repositories)
- [x] **AI Service Migration** — перенос 12 промптов из geminiService.ts в GeminiAiService (infrastructure)
- [x] **Use Cases & Application Layer** — 12 use cases (GenerateIdeas, GeneratePlan, GenerateThumbnail, etc.)
- [x] **Database Layer (PostgreSQL + Drizzle)** — schema, migrations, repository implementations, docker-compose для локальной БД
- [x] **API Routes & Middleware** — Hono routes с Zod-валидацией, CORS, rate limiter, error handler, health check
- [x] **Frontend Foundation (Vue 3 + Quasar)** — client/ scaffold с Quasar CLI, routing, MainLayout, Pinia stores
- [x] **Core UI Migration** — IndexPage (поиск, список идей), PlanPage (просмотр плана), NicheToggle, IdeaCard
- [x] **AI Tools UI Components** — ThumbnailGenerator, TitleGenerator, DescriptionGenerator, BrandingGenerator, прочие AI-инструменты
- [x] **State Management & Data Persistence** — Pinia stores, сохранение/загрузка идей и планов из PostgreSQL
- [x] **Docker & Dokploy Deployment** — multi-stage Dockerfile, docker-compose.yml, Dokploy конфигурация, env management
- [x] **Documentation Update** — обновить docs/ под fullstack архитектуру, README.md, getting-started
- [x] **Legacy Cleanup & Polish** — удалить src/ (React), обновить CI/CD, финальное тестирование, production readiness
- [x] **E2E Testing (Playwright)** — настройка Playwright, тесты ключевых флоу: генерация идей, просмотр плана, AI-инструменты, persistence
- [x] **Usage Analytics & Monitoring** — интеграция аналитики (Plausible/PostHog), трекинг действий пользователя, API-метрики, дашборд мониторинга
- [x] **Auth Domain & Database Schema** — User/Role/Session entities, ports (IUserRepository, IAuthService), Drizzle-схема (users, roles, sessions), миграции
- [x] **Auth Backend (Hono)** — JWT-сервис, bcrypt хеширование, auth middleware, маршруты login/register/logout/refresh, Zod-валидация
- [x] **Role-Based Access Control (RBAC)** — 4-ролевая модель (Owner → Admin → Editor → Viewer), permission-система, ролевые middleware, защита API-маршрутов
- [x] **Auth Frontend (Vue 3 + Quasar)** — Login/Register страницы, Pinia auth store, route guards, token management, useAuth composable
- [x] **User-Scoped Data** — userId в таблицах ideas/plans, миграция, фильтрация данных по пользователю, обновление репозиториев
- [x] **Admin Panel** — Управление пользователями, назначение ролей, просмотр активности, административный дашборд
- [x] **Auth E2E Testing** — Playwright-тесты для авторизации: регистрация, логин, защищённые маршруты, RBAC
- [x] **Export Plans (PDF & DOCX)** — Серверный экспорт планов в PDF/DOCX через pdfkit/docx, API endpoint, кнопки скачивания во фронтенде, тесты

## Completed

| Milestone | Date |
|-----------|------|
| Project Setup & Architecture Planning | 2026-02-25 |
| Git Repository & Monorepo Workspace | 2026-02-25 |
| Backend Foundation (Hono + Domain) | 2026-02-25 |
| AI Service Migration | 2026-02-25 |
| Use Cases & Application Layer | 2026-02-25 |
| Database Layer (PostgreSQL + Drizzle) | 2026-02-25 |
| API Routes & Middleware | 2026-02-25 |
| Frontend Foundation (Vue 3 + Quasar) | 2026-02-25 |
| Core UI Migration | 2026-02-25 |
| AI Tools UI Components | 2026-02-25 |
| Documentation Update | 2026-02-25 |
| Legacy Cleanup & Polish | 2026-02-25 |
| State Management & Data Persistence | 2026-02-25 |
| Docker & Dokploy Deployment | 2026-02-26 |
| E2E Testing (Playwright) | 2026-02-26 |
| Usage Analytics & Monitoring | 2026-02-26 |
| Auth Domain & Database Schema | 2026-02-26 |
| Auth Backend (Hono) | 2026-02-26 |
| Role-Based Access Control (RBAC) | 2026-02-26 |
| Auth Frontend (Vue 3 + Quasar) | 2026-02-26 |
| Auth E2E Testing | 2026-02-26 |
| User-Scoped Data | 2026-02-26 |
| Admin Panel | 2026-02-26 |
| Export Plans (PDF & DOCX) | 2026-02-26 |
