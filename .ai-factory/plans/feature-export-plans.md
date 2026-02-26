# Plan: Export Plans to PDF & DOCX

**Branch:** `feature/export-plans`
**Created:** 2026-02-26

## Settings

- **Testing:** Yes (backend unit + integration + E2E)
- **Logging:** Verbose (DEBUG level)
- **Documentation:** Yes (update after implementation)

## Overview

Add server-side export of video plans to PDF and DOCX formats. Plans include metadata (title, niche, creation date) and full markdown content rendered into formatted documents.

**Architecture:**
- Domain: `IDocumentExporter` port
- Infrastructure: `DocumentExporter` using `pdfkit` (PDF) + `docx` (DOCX) + `markdown-it` (parser)
- Application: `ExportPlan` use case
- Presentation: `GET /api/plans/:id/export?format=pdf|docx`
- Frontend: download method in `useApi`, `useExportPlan` composable, buttons in PlanPage

## Tasks

### Phase 1: Domain & Shared Types
- [x] Task 1: Create `IDocumentExporter` port and shared export types
  - `server/src/domain/ports/IDocumentExporter.ts`
  - `shared/types/export.ts` + re-export from `shared/types/index.ts`

### Phase 2: Infrastructure
- [x] Task 2: Implement `DocumentExporter` infrastructure (PDF + DOCX)
  - Install: `pdfkit`, `@types/pdfkit`, `docx`, `markdown-it` (server), `@types/markdown-it` (server)
  - `server/src/infrastructure/export/DocumentExporter.ts`
  - Markdown → tokens → PDF/DOCX with metadata header

### Phase 3: Application Layer
- [x] Task 3: Create `ExportPlan` use case
  - `server/src/application/use-cases/ExportPlan.ts`
  - Fetch plan, delegate to exporter, return buffer + filename + contentType

### Phase 4: API Endpoint
- [x] Task 4: Add export API endpoint and wire dependencies
  - `server/src/presentation/schemas.ts` — `exportPlanQuerySchema`
  - `server/src/presentation/routes/plans.ts` — `GET /:id/export`
  - `server/src/presentation/app.ts` — update AppDeps
  - `server/src/index.ts` — wire DocumentExporter + ExportPlan

### Phase 5: Frontend
- [x] Task 5: Add frontend download support and export UI
  - `client/src/composables/useApi.ts` — add `download()` method
  - `client/src/composables/useExportPlan.ts` — export composable
  - `client/src/pages/PlanPage.vue` — export buttons (PDF / DOCX)

### Phase 6: Testing
- [x] Task 6: Add backend tests for export feature
  - `server/src/application/use-cases/__tests__/ExportPlan.test.ts`
  - Export endpoint integration tests in plans route tests
- [x] Task 7: Add E2E tests for plan export
  - `e2e/tests/plan-export.spec.ts`
  - Update POM, mocks, fixtures

### Phase 7: Documentation
- [x] Task 8: Update documentation and roadmap
  - `.ai-factory/DESCRIPTION.md`, `ARCHITECTURE.md`, `ROADMAP.md`

## Commit Plan

### Checkpoint 1 (after Tasks 1-4): Backend complete
```
feat(export): add plan export to PDF and DOCX via server API
```

### Checkpoint 2 (after Task 5): Frontend complete
```
feat(export): add plan export UI with PDF and DOCX download buttons
```

### Checkpoint 3 (after Tasks 6-8): Tests & docs
```
test(export): add backend and E2E tests for plan export

docs: update architecture and roadmap for plan export feature
```
