# Project: NeuroTube Creator

## Overview
AI-powered YouTube idea generator and script outliner for psychology/neuroscience and ambient/meditation channels. Fullstack application with Vue 3 + Quasar frontend and Hono API backend, powered by Google Gemini API. Generates video ideas, full production plans, thumbnails, channel branding, and monetization strategies — all optimized for Tier-1 (US/Europe) audiences.

## Core Features
- **Dual-Niche Support:** Psychology/Neuroscience and Ambient/Meditation modes with niche-specific prompts and UI
- **Video Idea Generation:** 5 clickable ideas with SEO keywords, hooks, and audience analysis
- **Full Video Plan:** Detailed script outline, chapters, thumbnail concepts, SEO description, retention triggers
- **Thumbnail Generation:** AI image generation via Gemini Pro Image
- **Title Generator:** Alternative viral title suggestions for any working title
- **YouTube Description Generator:** SEO-optimized descriptions with spoiler-free timestamps
- **NotebookLM Integration:** Source document generation for AI podcast creation
- **Shorts Spinoffs:** 3 YouTube Shorts ideas as traffic funnels
- **Niche Analysis:** Web-powered competitive analysis with Google Search grounding
- **Channel Branding:** Channel names, SEO descriptions, avatar and banner generation
- **Suno.ai Prompt Generator:** Optimized music prompts for ambient track creation
- **Monetization Copy:** Patreon/Boosty promotional text generation
- **30-Day Content Roadmap:** Strategic content plan with long-form and Shorts ideas
- **Data Persistence:** Save and browse generated ideas and plans (PostgreSQL)
- **Authentication:** User registration/login with JWT access tokens (15m, HS256 via jose) + refresh token rotation (7d, opaque UUID), bcrypt password hashing, auth middleware, session management
- **Role-Based Access:** 4-tier hierarchy (Owner → Admin → Editor → Viewer) with permission checking

## Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API) + Quasar Framework
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router (via Quasar)
- **UI Components:** Quasar Material Design components
- **Icons:** Quasar icons (Material Icons)
- **Analytics:** PostHog (`posthog-js`) — opt-in client-side event tracking and auto-pageviews

### Backend
- **Runtime:** Node.js
- **Framework:** Hono (TypeScript-first, lightweight)
- **Validation:** Zod
- **AI Provider:** Google Gemini API (`@google/genai`) — gemini-3-flash-preview (text), gemini-3-pro-image-preview (images)
- **Analytics:** PostHog (`posthog-node`) — opt-in server-side event tracking and API metrics
- **Auth:** `jose` (JWT HS256 access tokens), `bcryptjs` (password hashing)

### Database
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM (TypeScript-first, lightweight)

### Shared
- **Language:** TypeScript (monorepo with shared types)

### Testing
- **E2E Testing:** Playwright (Page Object Model, API mocking via page.route())
- **Unit Testing:** Vitest (client, server, E2E helpers)

### Infrastructure
- **Deployment:** Dokploy (self-hosted PaaS, Docker)
- **CI/CD:** GitHub Actions
- **Build Automation:** Makefile

## Architecture
See `.ai-factory/ARCHITECTURE.md` for detailed architecture guidelines.
Pattern: Clean Architecture (backend) + Quasar conventions (frontend)

## Architecture Notes
- Monorepo: `client/` (Vue+Quasar) + `server/` (Hono) + `shared/` (types)
- Backend: Clean Architecture with dependency inversion (domain → application → infrastructure → presentation)
- Frontend: Quasar conventions (pages/, layouts/, components/, composables/, stores/)
- API key lives server-side only — never exposed to client
- All AI calls proxied through Hono backend
- Single Docker container serves both API and static frontend
- PostgreSQL as separate Dokploy service
- UI language: Russian; Generated content language: English (Tier-1 target)

## Non-Functional Requirements
- **Performance:** Hono lightweight backend, Vite-optimized frontend build
- **Error handling:** Zod validation on API, structured error responses
- **Security:** API key server-side only, rate limiting, CORS
- **Responsiveness:** Quasar responsive grid and breakpoint utilities
- **Accessibility:** Quasar ARIA-compliant components
- **Persistence:** PostgreSQL for saving generated ideas, plans, history
- **Authentication:** JWT access + refresh tokens, bcrypt password hashing, session management
- **Authorization:** 4-tier role hierarchy (Owner → Admin → Editor → Viewer) with ROLE_HIERARCHY permission system
