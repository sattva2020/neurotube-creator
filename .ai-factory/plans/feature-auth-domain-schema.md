# Auth Domain & Database Schema

**Branch:** `feature/auth-domain-schema`
**Created:** 2026-02-26
**Milestone:** Auth Domain & Database Schema (ROADMAP.md)

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — Vitest unit (domain) + integration (repositories) |
| Logging | Verbose — DEBUG logs for all auth operations |
| Docs | Yes — update ARCHITECTURE.md + DESCRIPTION.md |

## Overview

Foundation for the authentication system: domain entities (User, Role, Session), repository ports and implementations, Drizzle schema with migrations, shared types, and env configuration.

**Role model:** Owner → Admin → Editor → Viewer (4-tier hierarchy)

**Auth approach:** JWT access + refresh tokens (decided in next milestone), this milestone prepares the data layer.

## Tasks

### Phase 1: Domain Layer (entities + ports)

- [x] **Task 1:** Create User entity and Role value object
  - `server/src/domain/entities/User.ts` — User interface
  - `server/src/domain/entities/Role.ts` — Role type + ROLE_HIERARCHY

- [x] **Task 2:** Create Session entity
  - `server/src/domain/entities/Session.ts` — Session interface (refresh tokens)

- [x] **Task 3:** Update domain entities index.ts *(blocked by: 1, 2)*
  - Re-export User, Role, Session, ROLE_HIERARCHY

- [x] **Task 4:** Create IUserRepository port
  - `server/src/domain/ports/IUserRepository.ts` — save, findByEmail, findById, updateRole, updatePassword, deactivate, findAll

- [x] **Task 5:** Create ISessionRepository port
  - `server/src/domain/ports/ISessionRepository.ts` — save, findByToken, deleteByToken, deleteAllByUserId, deleteExpired

- [x] **Task 6:** Create IPasswordHasher port
  - `server/src/domain/ports/IPasswordHasher.ts` — hash, verify

- [x] **Task 7:** Update domain ports index.ts *(blocked by: 4, 5, 6)*
  - Re-export IUserRepository, ISessionRepository, IPasswordHasher

### Phase 2: Database Schema

- [x] **Task 8:** Add auth tables to Drizzle schema *(blocked by: 1, 2)*
  - `users` table: id, email (unique), displayName, passwordHash, role, isActive, createdAt, updatedAt
  - `sessions` table: id, userId (FK cascade), refreshToken (unique), expiresAt, userAgent, ipAddress, createdAt

- [x] **Task 9:** Generate and review Drizzle migration *(blocked by: 8)*
  - `npx drizzle-kit generate` — verify SQL, do NOT run migrate

### Phase 3: Infrastructure (repositories + config)

- [x] **Task 10:** Implement UserRepository *(blocked by: 4, 8)*
  - `server/src/infrastructure/db/UserRepository.ts` — implements IUserRepository with Drizzle
  - Follow IdeaRepository patterns: timing, verbose logging, toEntity mapper

- [x] **Task 11:** Implement SessionRepository *(blocked by: 5, 8)*
  - `server/src/infrastructure/db/SessionRepository.ts` — implements ISessionRepository
  - findByToken must check expiresAt > now

- [x] **Task 12:** Add auth env vars to config
  - JWT_SECRET (min 32 chars), JWT_ACCESS_EXPIRES_IN (default '15m'), JWT_REFRESH_EXPIRES_IN (default '7d')
  - Update `.env.example`

### Phase 4: Shared Types

- [x] **Task 13:** Create shared auth types *(blocked by: 1)*
  - `shared/types/auth.ts` — UserPublic, Role, LoginRequest, RegisterRequest, AuthTokens, AuthResponse
  - Update `shared/types/index.ts` barrel

### Phase 5: Tests

- [x] **Task 14:** Write unit tests for domain entities and ports *(blocked by: 1, 2, 4, 5, 6)*
  - `server/src/domain/__tests__/auth-entities.test.ts`
  - `server/src/domain/__tests__/auth-ports.test.ts`

- [x] **Task 15:** Write integration tests for auth repositories *(blocked by: 10, 11)*
  - `server/src/infrastructure/db/__tests__/UserRepository.test.ts`
  - `server/src/infrastructure/db/__tests__/SessionRepository.test.ts`

### Phase 6: Documentation

- [x] **Task 16:** Update ARCHITECTURE.md and DESCRIPTION.md *(blocked by: 8, 10, 11)*
  - Add auth entities, ports, schema to architecture docs
  - Add auth to Core Features in DESCRIPTION.md

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|------------|-------|----------------|
| 1 | 1-7 | `feat(auth): add User, Role, Session domain entities and repository ports` |
| 2 | 8-9 | `feat(auth): add users and sessions Drizzle schema with migration` |
| 3 | 10-12 | `feat(auth): implement UserRepository, SessionRepository, and auth env config` |
| 4 | 13 | `feat(auth): add shared auth types for frontend` |
| 5 | 14-15 | `test(auth): add unit and integration tests for auth domain and repositories` |
| 6 | 16 | `docs(auth): update ARCHITECTURE.md and DESCRIPTION.md with auth layer` |

## New Files Summary

```
server/src/domain/entities/User.ts          # NEW
server/src/domain/entities/Role.ts          # NEW
server/src/domain/entities/Session.ts       # NEW
server/src/domain/entities/index.ts         # MODIFIED
server/src/domain/ports/IUserRepository.ts  # NEW
server/src/domain/ports/ISessionRepository.ts # NEW
server/src/domain/ports/IPasswordHasher.ts  # NEW
server/src/domain/ports/index.ts            # MODIFIED
server/src/infrastructure/db/schema.ts      # MODIFIED
server/src/infrastructure/db/UserRepository.ts    # NEW
server/src/infrastructure/db/SessionRepository.ts # NEW
server/src/infrastructure/config/env.ts     # MODIFIED
server/drizzle/XXXX_migration.sql           # GENERATED
shared/types/auth.ts                        # NEW
shared/types/index.ts                       # MODIFIED
server/src/domain/__tests__/auth-entities.test.ts # NEW
server/src/domain/__tests__/auth-ports.test.ts    # NEW
server/src/infrastructure/db/__tests__/UserRepository.test.ts    # NEW
server/src/infrastructure/db/__tests__/SessionRepository.test.ts # NEW
.env.example                                # MODIFIED
.ai-factory/ARCHITECTURE.md                 # MODIFIED
.ai-factory/DESCRIPTION.md                  # MODIFIED
```
