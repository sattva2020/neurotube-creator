# Auth Backend (Hono)

**Branch:** `feature/auth-backend`
**Created:** 2026-02-26
**Milestone:** Auth Backend (Hono) (ROADMAP.md)

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — Vitest unit (infrastructure, use cases) + integration (routes, middleware) |
| Logging | Verbose — DEBUG logs for all auth operations |
| Docs | Yes — update ARCHITECTURE.md + DESCRIPTION.md |

## Overview

Full JWT authentication backend: bcrypt password hashing, jose-based JWT access/refresh tokens, auth middleware, login/register/logout/refresh routes with Zod validation. Token rotation for refresh tokens.

**Packages:** `jose` (JWT, ESM-native), `bcryptjs` (password hashing, pure JS)
**Auth flow:** Register/Login → access token (15m) + refresh token (7d) → refresh rotation → logout

## Tasks

### Phase 1: Dependencies & Ports

- [x] **Task 1:** Install jose + bcryptjs and harden JWT env config
- [x] **Task 2:** Create ITokenService port
  - `server/src/domain/ports/ITokenService.ts` — generateAccessToken, generateRefreshToken, verifyAccessToken

### Phase 2: Infrastructure

- [x] **Task 3:** Implement BcryptHasher *(blocked by: 1)*
  - `server/src/infrastructure/auth/BcryptHasher.ts` — implements IPasswordHasher
- [x] **Task 4:** Implement JwtService *(blocked by: 1, 2)*
  - `server/src/infrastructure/auth/JwtService.ts` — implements ITokenService with jose

### Phase 3: Application (Use Cases)

- [x] **Task 5:** Create Register use case *(blocked by: 2, 3, 4)*
  - `server/src/application/use-cases/Register.ts`
- [x] **Task 6:** Create Login use case *(blocked by: 2, 3, 4)*
  - `server/src/application/use-cases/Login.ts`
- [x] **Task 7:** Create RefreshTokens use case *(blocked by: 2, 4)*
  - `server/src/application/use-cases/RefreshTokens.ts`
- [x] **Task 8:** Create Logout use case *(blocked by: 2)*
  - `server/src/application/use-cases/Logout.ts`

### Phase 4: Presentation

- [x] **Task 9:** Add auth Zod schemas to schemas.ts
  - `server/src/presentation/schemas.ts` — registerSchema, loginSchema, refreshSchema, logoutSchema
- [x] **Task 10:** Create auth routes *(blocked by: 5, 6, 7, 8, 9, 11)*
  - `server/src/presentation/routes/auth.ts` — POST register/login/refresh/logout + GET /me
- [x] **Task 11:** Create authMiddleware *(blocked by: 4)*
  - `server/src/presentation/middleware/authMiddleware.ts` — verify Bearer token, attach user to context
- [x] **Task 12:** Wire auth into AppDeps, createApp, and index.ts *(blocked by: 5-11)*
  - `server/src/presentation/app.ts` + `server/src/index.ts`

### Phase 5: Tests

- [x] **Task 13:** Write unit tests for BcryptHasher and JwtService *(blocked by: 3, 4)*
  - `server/src/infrastructure/auth/__tests__/BcryptHasher.test.ts`
  - `server/src/infrastructure/auth/__tests__/JwtService.test.ts`
- [x] **Task 14:** Write unit tests for auth use cases *(blocked by: 5, 6, 7, 8)*
  - `server/src/application/use-cases/__tests__/auth-use-cases.test.ts`
- [x] **Task 15:** Write route and middleware tests for auth endpoints *(blocked by: 10, 11)*
  - `server/src/presentation/routes/__tests__/auth.test.ts`
  - `server/src/presentation/middleware/__tests__/authMiddleware.test.ts`

### Phase 6: Documentation

- [x] **Task 16:** Update ARCHITECTURE.md and DESCRIPTION.md *(blocked by: 10, 11, 12)*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|------------|-------|----------------|
| 1 | 1-2 | `feat(auth): add ITokenService port, install jose and bcryptjs` |
| 2 | 3-4 | `feat(auth): implement BcryptHasher and JwtService` |
| 3 | 5-8 | `feat(auth): add Register, Login, RefreshTokens, Logout use cases` |
| 4 | 9-12 | `feat(auth): add auth routes, middleware, and wire into app` |
| 5 | 13-15 | `test(auth): add unit and integration tests for auth backend` |
| 6 | 16 | `docs(auth): update ARCHITECTURE.md and DESCRIPTION.md with auth backend` |

## New Files Summary

```
server/src/domain/ports/ITokenService.ts          # NEW
server/src/domain/ports/index.ts                   # MODIFIED
server/src/infrastructure/auth/BcryptHasher.ts     # NEW
server/src/infrastructure/auth/JwtService.ts       # NEW
server/src/application/use-cases/Register.ts       # NEW
server/src/application/use-cases/Login.ts          # NEW
server/src/application/use-cases/RefreshTokens.ts  # NEW
server/src/application/use-cases/Logout.ts         # NEW
server/src/presentation/schemas.ts                 # MODIFIED
server/src/presentation/routes/auth.ts             # NEW
server/src/presentation/middleware/authMiddleware.ts # NEW
server/src/presentation/app.ts                     # MODIFIED
server/src/index.ts                                # MODIFIED
server/src/infrastructure/config/env.ts            # MODIFIED
server/src/infrastructure/auth/__tests__/BcryptHasher.test.ts  # NEW
server/src/infrastructure/auth/__tests__/JwtService.test.ts    # NEW
server/src/application/use-cases/__tests__/auth-use-cases.test.ts # NEW
server/src/presentation/routes/__tests__/auth.test.ts          # NEW
server/src/presentation/middleware/__tests__/authMiddleware.test.ts # NEW
.ai-factory/ARCHITECTURE.md                        # MODIFIED
.ai-factory/DESCRIPTION.md                         # MODIFIED
```
