# Plan: AI Service Migration

**Branch:** `feature/ai-service-migration`
**Created:** 2026-02-25
**Milestone:** AI Service Migration

## Settings

- **Testing:** Yes — GeminiAiService with mocked Gemini SDK
- **Logging:** Verbose — DEBUG for every AI call (prompt, response, parse, timing)
- **Docs:** Yes — update AGENTS.md and ROADMAP.md

## Overview

Migrate all 12 AI generation functions from legacy `client/src-legacy/services/geminiService.ts` into `server/src/infrastructure/ai/GeminiAiService.ts`, implementing the `IAiService` port defined in the domain layer.

The 12 methods fall into 3 patterns:
- **JSON schema** (3 methods): generateIdeas, generateTitles, generateBranding — use `responseMimeType: "application/json"` + `responseSchema`
- **Raw text** (7 methods): generatePlan, generateDescription, generateNotebookLMSource, generateShortsSpinoffs, generateMonetizationCopy, generateContentRoadmap, generateSunoPrompt
- **Special** (2 methods): generateThumbnail (image model), analyzeNiche (Google Search grounding)

## Tasks

### Phase 1: Scaffold (Task 19)

- [x] **Task 19: Create GeminiAiService scaffold with helpers**
  - `server/src/infrastructure/ai/GeminiAiService.ts` — class, constructor, helpers, stubs
  - Singleton `GoogleGenAI` instance, private helpers for text calls, JSON parse, niche prompts

### Phase 2: Method Implementation (Tasks 20-22)

- [x] **Task 20: Implement JSON-schema methods**
  - generateIdeas, generateTitles, generateBranding
  - *Blocked by: Task 19*

- [x] **Task 21: Implement text generation methods (7 methods)**
  - generatePlan, generateDescription, generateNotebookLMSource, generateShortsSpinoffs, generateMonetizationCopy, generateContentRoadmap, generateSunoPrompt
  - *Blocked by: Task 19*

- [x] **Task 22: Implement special methods**
  - generateThumbnail (gemini-3-pro-image-preview, base64), analyzeNiche (Google Search grounding)
  - *Blocked by: Task 19*

### Phase 3: Testing & Verification (Tasks 23-24)

- [x] **Task 23: Write tests for GeminiAiService**
  - `server/src/infrastructure/ai/__tests__/GeminiAiService.test.ts`
  - Mock `@google/genai`, test all 3 patterns + error handling
  - *Blocked by: Tasks 20, 21, 22*

- [x] **Task 24: Verify compilation, tests, and update docs**
  - tsc --noEmit, vitest run, update AGENTS.md + ROADMAP.md
  - *Blocked by: Task 23*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 19-22 | `feat(server): implement GeminiAiService with all 12 AI methods` |
| 2 | Tasks 23-24 | `test(server): add GeminiAiService tests with mocked SDK` |

## Dependencies

```
Task 19 (scaffold) ──┬──→ Task 20 (JSON methods) ──┐
                     ├──→ Task 21 (text methods)  ──┼──→ Task 23 (tests) ──→ Task 24 (verify+docs)
                     └──→ Task 22 (special methods)─┘
```
