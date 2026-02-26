# Plan: Admin Panel — Activity Log & Dashboard

- **Branch:** `feature/admin-panel`
- **Created:** 2026-02-26
- **Base:** `master`

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — unit + integration + E2E (Playwright) |
| Logging | Verbose (DEBUG) |
| Documentation | Yes — DESCRIPTION.md, ARCHITECTURE.md, ROADMAP.md |

## Summary

Complete the Admin Panel milestone by adding:
1. **Activity Log** — audit trail of admin and user actions (role changes, deactivation, logins, registrations)
2. **Admin Dashboard** — stats cards (users, ideas, plans, registrations) + role distribution
3. **Tabbed UI** — refactor AdminPage.vue from single user table to 3-tab layout (Dashboard, Users, Activity)

## Tasks

### Phase 1: Activity Log Infrastructure (Tasks 1-3)

**Task 1: Create activity_logs DB table + Drizzle migration** ✅
- Add `activity_logs` table to `server/src/infrastructure/db/schema.ts`
- Columns: id (uuid PK), userId (FK users), action (text), resourceType (text), resourceId (uuid nullable), metadata (jsonb), ipAddress (text nullable), createdAt (timestamp)
- Create migration `server/drizzle/0003_add_activity_logs.sql`
- Files: `schema.ts`, migration SQL

**Task 2: Create ActivityLog entity + IActivityLogRepository port** ✅
- Domain entity: `server/src/domain/entities/ActivityLog.ts`
- Port interface: `server/src/domain/ports/IActivityLogRepository.ts` with `save()`, `findAll()`, `count()`
- Files: 2 new files in domain layer

**Task 3: Implement ActivityLogRepository with Drizzle** *(blocked by: 1, 2)* ✅
- `server/src/infrastructure/db/ActivityLogRepository.ts`
- Implements IActivityLogRepository using Drizzle ORM
- Methods: save, findAll (paginated + filters), count
- Files: 1 new infrastructure file

### Phase 2: Use Cases & Integration (Tasks 4-5)

**Task 4: Create LogActivity and GetActivityLogs use cases** *(blocked by: 2)* ✅
- `server/src/application/use-cases/LogActivity.ts` — saves activity log entry
- `server/src/application/use-cases/GetActivityLogs.ts` — returns paginated logs with total
- Files: 2 new use case files

**Task 5: Add activity logging to existing admin + auth routes** *(blocked by: 3, 4)* ✅
- Log admin actions: role changes (`user.role_updated`), deactivation (`user.deactivated`)
- Log auth events: registration (`user.registered`), login (`user.login`)
- Update DI: `AdminRoutesDeps`, `AuthRoutesDeps`, `AppDeps`, `index.ts`
- Files: `admin.ts`, `auth.ts`, `app.ts`, `index.ts`

### Phase 3: Admin Stats & API (Tasks 6-7)

**Task 6: Create GetAdminStats use case** *(blocked by: 3)* ✅
- Aggregate: totalUsers, activeUsers, totalIdeas, totalPlans, recentRegistrations (7d), roleDistribution
- Add `countAll()` to IIdeaRepository/IPlanRepository + implementations
- Add `countActive()`, `countByRole()`, `countSince()` to IUserRepository + implementation
- Files: 1 new use case + updates to ports and repositories

**Task 7: Add admin stats and activity logs API endpoints** *(blocked by: 4, 5, 6)* ✅
- `GET /api/admin/stats` → GetAdminStats
- `GET /api/admin/activity-logs?limit=50&offset=0&userId=x&action=x` → GetActivityLogs
- Create `shared/types/admin.ts` — AdminStats, ActivityLogEntry, ActivityLogsResponse
- Update Zod schemas, AdminRoutesDeps, AppDeps, index.ts
- Files: new shared types + updates to admin routes + DI wiring

### Phase 4: Frontend (Task 8)

**Task 8: Refactor AdminPage.vue with tabs** *(blocked by: 7)* ✅
- Tab 1: Dashboard — stats cards (q-card grid), role distribution bars (q-linear-progress)
- Tab 2: Users — existing user management table (moved from current flat layout)
- Tab 3: Activity Log — paginated table with filters (action type, user)
- New composable: `client/src/composables/useAdminDashboard.ts` — fetchStats, fetchActivityLogs
- Human-readable action labels in Russian
- Files: `AdminPage.vue` (major refactor), `useAdminDashboard.ts` (new)

### Phase 5: Testing (Tasks 9-10)

**Task 9: Backend tests** *(blocked by: 7)* ✅
- Unit: LogActivity, GetActivityLogs, GetAdminStats use cases
- Integration: GET /api/admin/stats, GET /api/admin/activity-logs
- Extend existing `admin.test.ts`
- Files: 3 new test files + extend existing

**Task 10: E2E tests with Playwright** *(blocked by: 8)* ✅
- Update AdminPage POM with tab navigation methods
- Test: dashboard loads with stats, activity log shows entries, tab switching
- Test: role change creates activity log entry
- Files: update POM, new spec file

### Phase 6: Documentation (Task 11)

**Task 11: Update documentation** *(blocked by: 8, 9, 10)* ✅
- DESCRIPTION.md — add Admin Panel features
- ARCHITECTURE.md — add activity_logs table, new API routes, new files
- ROADMAP.md — mark Admin Panel `[x]`, add to Completed table

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|-----------|------------|----------------|
| 1 | 1-3 | `feat(admin): add activity_logs table, entity, and repository` |
| 2 | 4-5 | `feat(admin): add activity logging to admin and auth routes` |
| 3 | 6-7 | `feat(admin): add admin stats endpoint and activity logs API` |
| 4 | 8 | `feat(admin): refactor AdminPage with dashboard tabs and activity log UI` |
| 5 | 9-10 | `test(admin): add backend and E2E tests for admin dashboard` |
| 6 | 11 | `docs: update project docs for admin panel completion` |

## Dependency Graph

```
[1] DB Schema ──────┐
                    ├──→ [3] Repository ──→ [5] Route logging ──→ [7] API Endpoints ──→ [8] Frontend ──→ [10] E2E Tests ──┐
[2] Domain Entity ──┤                                              ↑                                                      ├→ [11] Docs
                    ├──→ [4] Use Cases ────→ [5] ─────────────────→┤                     [9] Backend Tests ───────────────┘
                    │                                               │
                    └──→ [6] Stats Use Case ───────────────────────┘
```
