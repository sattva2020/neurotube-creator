# Plan: AI Tools UI Components

- **Branch:** `feature/ai-tools-ui`
- **Created:** 2026-02-25
- **Milestone:** AI Tools UI Components

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — Vitest tests for composables, components, page |
| Logging | Verbose — console.debug on every action |
| Docs | Yes — update docs/architecture.md, docs/ai-features.md |

## Overview

10 AI-инструментов с готовыми бэкенд-эндпоинтами (Hono) нуждаются в фронтенд-компонентах. UI-паттерн: единая ToolsPage со сеткой карточек, клик открывает q-dialog с формой ввода и результатом.

### Backend Endpoints (already implemented)

| Tool | Endpoint | Input | Output |
|------|----------|-------|--------|
| Thumbnail | POST /api/thumbnails/generate | `{prompt}` | `string\|null` (base64) |
| Titles | POST /api/titles/generate | `{titleIdea}` | `string[]` |
| Description | POST /api/descriptions/generate | `{videoTitle, planMarkdown, niche}` | `string\|null` |
| Branding | POST /api/branding/generate | `{videoTitle, niche}` | `ChannelBranding\|null` |
| NotebookLM | POST /api/notebooklm/generate | `{videoTitle, planMarkdown, niche}` | `string\|null` |
| Shorts | POST /api/shorts/generate | `{videoTitle, planMarkdown}` | `string\|null` |
| Niche Analysis | POST /api/analysis/niche | `{videoTitle, niche}` | `string\|null` |
| Monetization | POST /api/monetization/generate | `{videoTitle, niche}` | `string\|null` |
| Content Roadmap | POST /api/roadmap/generate | `{videoTitle, niche}` | `string\|null` |
| Suno Prompt | POST /api/suno/generate | `{videoTitle, planMarkdown}` | `string\|null` |

### Output Categories

- **Image:** Thumbnail (base64 → q-img)
- **String list:** Titles (string[] → q-list with copy)
- **Structured:** Branding (ChannelBranding → cards/chips)
- **Markdown:** 7 tools (string → markdown-it render)

## Tasks

### Phase 1: Foundation

- [x] **Task 1:** Add ChannelBranding to shared types + create toolResults Pinia store
  - `shared/types/idea.ts`, `shared/types/index.ts`, `client/src/stores/toolResults.ts`

- [x] **Task 2:** Create MarkdownResult.vue + ToolCard.vue shared components *(blocked by: Task 1)*
  - `client/src/components/MarkdownResult.vue`, `client/src/components/ToolCard.vue`

### Phase 2: Composables

- [x] **Task 3:** Create 10 AI tool composables *(blocked by: Task 1)*
  - `client/src/composables/useGenerate{Thumbnail,Titles,Description,Branding,NotebookLM,Shorts,Monetization,Roadmap,Suno}.ts`
  - `client/src/composables/useAnalyzeNiche.ts`

### Phase 3: Dialog Components

- [x] **Task 4:** ThumbnailDialog.vue — image generation *(blocked by: Tasks 2, 3)*
- [x] **Task 5:** TitlesDialog.vue — title list with copy *(blocked by: Tasks 2, 3)*
- [x] **Task 6:** BrandingDialog.vue — structured branding display *(blocked by: Tasks 2, 3)*
- [x] **Task 7:** MarkdownToolDialog.vue — generic dialog for 7 markdown tools *(blocked by: Tasks 2, 3)*

### Phase 4: Page Integration

- [ ] **Task 8:** ToolsPage.vue + route + navigation links *(blocked by: Tasks 4, 5, 6, 7)*
  - `client/src/pages/ToolsPage.vue`, `client/src/router/routes.ts`
  - `client/src/layouts/MainLayout.vue`, `client/src/pages/PlanPage.vue`

### Phase 5: Tests

- [ ] **Task 9:** Tests for 10 composables *(blocked by: Task 3)*
  - `client/src/composables/__tests__/use*.test.ts` (10 files)

- [ ] **Task 10:** Tests for components and ToolsPage *(blocked by: Task 8)*
  - `client/src/components/__tests__/{ToolCard,MarkdownResult,ThumbnailDialog,TitlesDialog,BrandingDialog,MarkdownToolDialog}.test.ts`
  - `client/src/pages/__tests__/ToolsPage.test.ts`

### Phase 6: Docs

- [ ] **Task 11:** Update documentation *(blocked by: Task 8)*
  - `docs/architecture.md`, `docs/ai-features.md`

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | 1, 2 | `feat(client): add tools store and shared UI components` |
| 2 | 3 | `feat(client): add 10 AI tool composables` |
| 3 | 4, 5, 6, 7 | `feat(client): add AI tool dialog components` |
| 4 | 8 | `feat(client): add ToolsPage with grid layout and navigation` |
| 5 | 9, 10 | `test(client): add AI tools composable and component tests` |
| 6 | 11 | `docs: update architecture and AI features docs for tools UI` |

## Architecture Notes

### Store Pattern
Единый `toolResults` store для всех 10 инструментов. Keyed loading state: `loading['thumbnail']`, `loading['titles']` и т.д.

### Dialog Pattern
3 уникальных диалога (Thumbnail, Titles, Branding) + 1 generic MarkdownToolDialog для 7 markdown-инструментов. Generic диалог принимает config с generate-функцией из composable.

### Data Flow
```
ToolsPage → ToolCard click → open dialog
  Dialog → composable.generate() → useApi.post('/api/...') → backend
  Backend → response → composable → store.setResult() → dialog renders result
```

### Navigation Flow
```
IndexPage → generate ideas → select idea
  → PlanPage → generate plan
    → ToolsPage (via "AI Tools" button or drawer link)
      → 10 tool cards → click → dialog → generate → result
```
