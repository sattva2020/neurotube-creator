# Auth Frontend (Vue 3 + Quasar)

**Branch:** `feature/auth-frontend`
**Created:** 2026-02-26
**Description:** Login/Register страницы, auth store, route guards, admin page

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — unit (Vitest) + E2E (Playwright) |
| Logging | Verbose — console.debug('[Tag] ...') everywhere |
| Docs | Yes — update DESCRIPTION.md + ARCHITECTURE.md |
| Constraints | Standard — follow existing project patterns |

## Context

**Backend ready:** Auth API полностью реализован (register, login, refresh, logout, /me, admin endpoints).
**Frontend gap:** Нет auth кода — ни stores, ни pages, ни guards, ни auth headers в useApi.

**Shared types уже определены:** `shared/types/auth.ts` — Role, UserPublic, LoginRequest, RegisterRequest, AuthTokens, AuthResponse, UpdateRoleRequest, AdminUserListResponse.

**Существующие паттерны:**
- Pinia Setup Store с ручной localStorage persistence (см. niche.ts)
- Composables: useApi() → try/catch/finally → re-throw (см. useGenerateIdeas.ts)
- API client: native fetch, `{ data: T }` envelope unwrapping
- UI язык: русский

## Tasks

### Phase 1: Auth Foundation (Store + API)

#### Task 1: ~~Создать auth store (stores/auth.ts)~~ [x]
- **Файл:** `client/src/stores/auth.ts`
- **State:** user, accessToken, refreshToken, isLoading
- **Computed:** isAuthenticated, userRole, isAdmin
- **Actions:** setAuth, clearAuth, login, register, logout, refresh, fetchMe, initFromStorage
- **Persistence:** manual localStorage (keys: neurotube-auth-tokens, neurotube-auth-user)
- **Logging:** `[AuthStore]` prefix

#### Task 2: ~~Обновить useApi.ts — Authorization header + 401 handling~~ [x]
- **Файл:** `client/src/composables/useApi.ts`
- Inject `Authorization: Bearer <token>` header из auth store
- Добавить `patch()` метод
- 401 → refresh → retry (не для /api/auth/* endpoints)
- **Blocked by:** Task 1

#### Task 3: ~~Экспортировать admin-типы из shared/types/index.ts~~ [x]
- **Файл:** `shared/types/index.ts`
- Добавить export: UpdateRoleRequest, AdminUserListResponse

### Phase 2: Auth Pages & Layout

#### Task 4: ~~Создать AuthLayout.vue~~ [x]
- **Файл:** `client/src/layouts/AuthLayout.vue`
- Минимальный layout без sidebar для login/register
- Центрированный контент, max-width ~400px
- **Blocked by:** Task 1

#### Task 5: ~~Создать LoginPage.vue~~ [x]
- **Файл:** `client/src/pages/LoginPage.vue`
- Email + password форма, Quasar components
- authStore.login() → redirect на /
- Error handling: 401, сетевые ошибки
- **Blocked by:** Task 1, Task 4

#### Task 6: ~~Создать RegisterPage.vue~~ [x]
- **Файл:** `client/src/pages/RegisterPage.vue`
- displayName + email + password + confirmPassword
- authStore.register() → redirect на /
- Error handling: 409 (user exists)
- **Blocked by:** Task 1, Task 4

### Phase 3: Routing & Guards

#### Task 7: ~~Обновить routes.ts — auth маршруты + meta fields~~ [x]
- **Файл:** `client/src/router/routes.ts`
- Добавить /login, /register под AuthLayout
- Добавить /admin под MainLayout
- meta: requiresAuth, requiresRole, guest
- RouteMeta declaration merging
- **Blocked by:** Task 4, Task 5, Task 6

#### Task 8: ~~Обновить router/index.ts — navigation guards~~ [x]
- **Файл:** `client/src/router/index.ts`
- beforeEach: auth check, role check, guest redirect
- initFromStorage + fetchMe при первом запуске
- ROLE_LEVEL hierarchy для проверки прав
- **Blocked by:** Task 1, Task 7

### Phase 4: App Shell Integration

#### Task 9: ~~Обновить MainLayout.vue — user info, logout, admin nav~~ [x]
- **Файл:** `client/src/layouts/MainLayout.vue`
- Toolbar: user displayName + role badge + logout button
- Drawer: admin nav item (conditional on isAdmin)
- **Blocked by:** Task 1, Task 8

### Phase 5: Admin Page

#### Task 10: ~~Создать AdminPage.vue — управление пользователями~~ [x]
- **Файл:** `client/src/pages/AdminPage.vue`
- q-table: email, displayName, role, isActive, createdAt
- PATCH role, POST deactivate
- Protection: нельзя менять свою роль, нельзя менять owner
- **Blocked by:** Task 2, Task 3, Task 7

### Phase 6: Tests

#### Task 11: ~~Unit-тесты auth store~~ [x]
- **Файл:** `client/src/stores/__tests__/auth.test.ts`
- State, actions, computed, persistence, error handling
- **Blocked by:** Task 1

#### Task 12: ~~Unit-тесты useApi (обновление)~~ [x]
- **Файл:** `client/src/composables/__tests__/useApi.test.ts`
- Auth header injection, 401 retry, patch method
- **Blocked by:** Task 2

#### Task 13: ~~Unit-тесты LoginPage + RegisterPage~~ [x]
- **Файлы:** `client/src/pages/__tests__/LoginPage.test.ts`, `RegisterPage.test.ts`
- Render, submit, validation, error display, redirect
- **Blocked by:** Task 5, Task 6

#### Task 14: ~~E2E тесты auth flow~~ [x]
- **Файлы:** `e2e/tests/auth.spec.ts`, Page Objects, mock updates
- Unauth redirect, register, login, logout, admin access
- **Blocked by:** Task 8, Task 9, Task 10

### Phase 7: Documentation

#### Task 15: ~~Обновить DESCRIPTION.md и ARCHITECTURE.md~~ [x]
- Auth frontend в Core Features
- Новые файлы в monorepo structure
- Auth flow description
- **Blocked by:** Task 10

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | 1, 2, 3 | `feat(auth): add auth store and update API client with token handling` |
| 2 | 4, 5, 6 | `feat(auth): add login and register pages with auth layout` |
| 3 | 7, 8 | `feat(auth): add route guards and auth-protected routing` |
| 4 | 9, 10 | `feat(auth): integrate auth into app shell and add admin page` |
| 5 | 11, 12, 13, 14 | `test(auth): add unit and E2E tests for auth frontend` |
| 6 | 15 | `docs: update project docs for auth frontend` |

## Files to Create

- `client/src/stores/auth.ts`
- `client/src/layouts/AuthLayout.vue`
- `client/src/pages/LoginPage.vue`
- `client/src/pages/RegisterPage.vue`
- `client/src/pages/AdminPage.vue`
- `client/src/stores/__tests__/auth.test.ts`
- `client/src/pages/__tests__/LoginPage.test.ts`
- `client/src/pages/__tests__/RegisterPage.test.ts`
- `e2e/tests/auth.spec.ts`
- `e2e/pages/LoginPage.ts`
- `e2e/pages/RegisterPage.ts`
- `e2e/pages/AdminPage.ts`

## Files to Modify

- `client/src/composables/useApi.ts` — auth header, patch method, 401 handling
- `client/src/router/routes.ts` — auth routes, meta fields
- `client/src/router/index.ts` — navigation guards
- `client/src/layouts/MainLayout.vue` — user info, logout, admin nav
- `shared/types/index.ts` — export admin types
- `client/src/composables/__tests__/useApi.test.ts` — auth test cases
- `e2e/helpers/api-mock.ts` — auth endpoint mocks
- `e2e/helpers/test-data.ts` — auth mock data
- `e2e/fixtures/test-fixtures.ts` — auth page fixtures
- `.ai-factory/DESCRIPTION.md` — auth frontend docs
- `.ai-factory/ARCHITECTURE.md` — auth frontend docs
