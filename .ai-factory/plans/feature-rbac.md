# Role-Based Access Control (RBAC)

**Branch:** `feature/rbac`
**Created:** 2026-02-26

## Settings

- **Testing:** Yes
- **Logging:** Verbose (DEBUG level)
- **Docs:** Yes
- **API Guard:** Global auth — all /api/* require auth (except public paths)

## Overview

Implement 4-tier role hierarchy (Owner > Admin > Editor > Viewer) with permission middleware, global auth guard, admin user management routes, and first-user-as-owner seeding.

**Foundation already exists:**
- `Role` type + `ROLE_HIERARCHY` (domain/entities/Role.ts)
- `AuthUser.role` in middleware context
- `IUserRepository.updateRole/findAll/deactivate` — ports + implementations
- `authMiddleware` (authentication only, no authorization)

**What this milestone adds:**
- `requireRole(minRole)` authorization middleware
- Global auth guard on /api/* with public path exclusions
- Admin use cases (GetAllUsers, UpdateUserRole, DeactivateUser)
- Admin API routes (/api/admin/users)
- First-user-as-owner auto-assignment
- Full test coverage

## Tasks

### Phase 1: Permission Infrastructure

- [x] **Task #33:** Create `requireRole` middleware factory
  - `createRequireRole(minRole)` in authMiddleware.ts
  - Uses ROLE_HIERARCHY comparison, returns 403 on denial

- [x] **Task #34:** Apply global auth guard to /api/* routes
  - `createGlobalAuthGuard` with public path exclusions
  - Apply in app.ts, simplify auth.ts /me route
  - Public: register, login, refresh, logout, health

### Phase 2: Admin Domain & Use Cases

- [x] **Task #35:** Add `count()` to IUserRepository port + implementation
  - Efficient user count for first-user-owner check

- [x] **Task #36:** Create admin use cases: GetAllUsers, UpdateUserRole, DeactivateUser
  - Privilege escalation prevention in UpdateUserRole
  - Owner protection (cannot demote/deactivate)

- [x] **Task #37:** Auto-assign owner role to first registered user
  - Modify Register.ts: if count === 0 → owner, else viewer

### Phase 3: Admin API Layer

- [x] **Task #38:** Add admin Zod schemas and shared types
  - updateUserRoleSchema, listUsersQuerySchema
  - UpdateRoleRequest, AdminUserListResponse in shared/types

- [x] **Task #39:** Create admin routes and wire into app
  - GET /api/admin/users, PATCH /users/:id/role, POST /users/:id/deactivate
  - Wire into AppDeps, createApp, index.ts

### Phase 4: Tests

- [x] **Task #40:** Unit tests for requireRole and global auth guard
  - requireRole: allow/deny by role hierarchy
  - Global guard: public paths skip, protected paths enforce

- [x] **Task #41:** Tests for admin routes and first-user-owner logic
  - Admin route CRUD + privilege escalation prevention
  - First-user-owner in Register

### Phase 5: Documentation

- [x] **Task #42:** Update ARCHITECTURE.md and DESCRIPTION.md
  - Add requireRole, globalAuthGuard, admin routes, admin use cases

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|------------|-------|----------------|
| 1 | #33, #34 | `feat(rbac): add requireRole middleware and global auth guard` |
| 2 | #35, #36, #37 | `feat(rbac): add admin use cases and first-user-owner seeding` |
| 3 | #38, #39 | `feat(rbac): add admin API routes and shared types` |
| 4 | #40, #41 | `test(rbac): add RBAC middleware and admin route tests` |
| 5 | #42 | `docs: update architecture for RBAC implementation` |
