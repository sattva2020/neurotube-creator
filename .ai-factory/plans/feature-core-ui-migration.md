# Plan: Core UI Migration

**Branch:** `feature/core-ui-migration`
**Created:** 2026-02-25
**Base branch:** `feature/frontend-foundation`

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes (Vitest + @vue/test-utils) |
| Logging | Verbose (DEBUG) |
| Docs | Yes (update docs/architecture.md) |

## Overview

Migrate the core UI from legacy React (client/src-legacy/) to Vue 3 + Quasar:
- **IndexPage**: search form, preset chips, niche toggle, idea cards list
- **PlanPage**: markdown rendering of generated video plan
- **NicheToggle**: reusable pill toggle component (psychology / ambient)
- **IdeaCard**: card component displaying a VideoIdea with badges, keywords, actions

## Tasks

### Phase 1: Shared Types & Dependencies

- [x] **Task 1: Add VideoPlan type to shared/ and install markdown-it**
  - Add `VideoPlan` interface to `shared/types/idea.ts`
  - Export from `shared/types/index.ts`
  - Install `markdown-it` + `@types/markdown-it` in client/
  - Files: `shared/types/idea.ts`, `shared/types/index.ts`, `client/package.json`

### Phase 2: Composables

- [x] **Task 2: Create useGenerateIdeas composable** ← blocked by Task 1
  - `client/src/composables/useGenerateIdeas.ts`
  - POST /api/ideas/generate via useApi
  - Updates ideasStore, handles loading/error
  - Verbose logging: topic, niche, result count, errors

- [x] **Task 3: Create useGeneratePlan composable** ← blocked by Task 1
  - `client/src/composables/useGeneratePlan.ts`
  - POST /api/plans/generate via useApi
  - Updates planStore, handles loading/error
  - Verbose logging: title, result length, errors

### Phase 3: Reusable Components

- [x] **Task 4: Create NicheToggle.vue component**
  - `client/src/components/NicheToggle.vue`
  - q-btn-toggle with icons (Brain / Headphones)
  - Uses nicheStore, resets ideasStore on toggle
  - Legacy ref: `client/src-legacy/App.tsx:161-185`

- [x] **Task 5: Create IdeaCard.vue component** ← blocked by Task 1
  - `client/src/components/IdeaCard.vue`
  - Props: idea (VideoIdea), isSelected (boolean)
  - Emits: select, generate-plan
  - Sections: title, badges, keywords, hook, whyItWorks, action button
  - Legacy ref: `client/src-legacy/components/IdeaCard.tsx`

### Phase 4: Page Implementations

- [x] **Task 6: Implement IndexPage.vue** ← blocked by Tasks 2, 4, 5
  - `client/src/pages/IndexPage.vue` (rewrite from stub)
  - Hero section + NicheToggle + search form + preset chips + ideas list
  - PRESETS config (6 topics per niche)
  - Navigate to /plan on "Generate plan" click
  - Legacy ref: `client/src-legacy/App.tsx:141-283`

- [x] **Task 7: Implement PlanPage.vue** ← blocked by Tasks 1, 3
  - `client/src/pages/PlanPage.vue` (rewrite from stub)
  - Generate plan from selected idea on mount
  - Render markdown via markdown-it + v-html
  - Copy to clipboard, back navigation
  - Loading/error states

### Phase 5: Tests

- [x] **Task 8: Tests for components & composables** ← blocked by Tasks 2-5
  - `client/src/components/__tests__/NicheToggle.test.ts`
  - `client/src/components/__tests__/IdeaCard.test.ts`
  - `client/src/composables/__tests__/useGenerateIdeas.test.ts`
  - `client/src/composables/__tests__/useGeneratePlan.test.ts`

- [x] **Task 9: Tests for IndexPage & PlanPage** ← blocked by Tasks 6, 7
  - `client/src/pages/__tests__/IndexPage.test.ts`
  - `client/src/pages/__tests__/PlanPage.test.ts`
  - Mount with mocked stores and router

### Phase 6: Documentation

- [x] **Task 10: Update docs** ← blocked by Tasks 6, 7
  - Rewrite `docs/architecture.md` (currently describes old React SPA)
  - Verify `README.md` accuracy

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | 1 | `feat(shared): add VideoPlan type and markdown-it dependency` |
| 2 | 2, 3 | `feat(client): add idea and plan generation composables` |
| 3 | 4, 5 | `feat(client): add NicheToggle and IdeaCard components` |
| 4 | 6, 7 | `feat(client): implement IndexPage and PlanPage` |
| 5 | 8, 9 | `test(client): add Core UI component and page tests` |
| 6 | 10 | `docs: update architecture docs for Vue 3 + Hono stack` |

## Key References

- **Legacy React app:** `client/src-legacy/App.tsx` (search form, presets, layout)
- **Legacy IdeaCard:** `client/src-legacy/components/IdeaCard.tsx` (card design)
- **Backend API routes:** `server/src/presentation/routes/ideas.ts`, `plans.ts`
- **Shared types:** `shared/types/idea.ts` (VideoIdea, Niche)
- **Architecture:** `.ai-factory/ARCHITECTURE.md` (dependency rules, code examples)
- **Existing stores:** `client/src/stores/` (ideas, plan, niche)
- **Existing composable:** `client/src/composables/useApi.ts` (get, post methods)
