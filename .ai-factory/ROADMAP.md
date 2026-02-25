# Project Roadmap

> AI-powered YouTube idea generator — миграция с React SPA на fullstack Vue 3 + Quasar + Hono + PostgreSQL

## Milestones

- [x] **Project Setup & Architecture Planning** — AI Factory context, DESCRIPTION.md, ARCHITECTURE.md, AGENTS.md, docs, Makefile, CI
- [ ] **Git Repository & Monorepo Workspace** — git init, npm workspaces (client/, server/, shared/), root tsconfig
- [ ] **Backend Foundation (Hono + Domain)** — server/ scaffold, Hono app, domain entities, ports (IAiService, repositories)
- [ ] **AI Service Migration** — перенос 12 промптов из geminiService.ts в GeminiAiService (infrastructure)
- [ ] **Use Cases & Application Layer** — 12 use cases (GenerateIdeas, GeneratePlan, GenerateThumbnail, etc.)
- [ ] **Database Layer (PostgreSQL + Drizzle)** — schema, migrations, repository implementations, docker-compose для локальной БД
- [ ] **API Routes & Middleware** — Hono routes с Zod-валидацией, CORS, rate limiter, error handler, health check
- [ ] **Frontend Foundation (Vue 3 + Quasar)** — client/ scaffold с Quasar CLI, routing, MainLayout, Pinia stores
- [ ] **Core UI Migration** — IndexPage (поиск, список идей), PlanPage (просмотр плана), NicheToggle, IdeaCard
- [ ] **AI Tools UI Components** — ThumbnailGenerator, TitleGenerator, DescriptionGenerator, BrandingGenerator, прочие AI-инструменты
- [ ] **State Management & Data Persistence** — Pinia stores, сохранение/загрузка идей и планов из PostgreSQL
- [ ] **Docker & Dokploy Deployment** — multi-stage Dockerfile, docker-compose.yml, Dokploy конфигурация, env management
- [ ] **Documentation Update** — обновить docs/ под fullstack архитектуру, README.md, getting-started
- [ ] **Legacy Cleanup & Polish** — удалить src/ (React), обновить CI/CD, финальное тестирование, production readiness

## Completed

| Milestone | Date |
|-----------|------|
| Project Setup & Architecture Planning | 2026-02-25 |
