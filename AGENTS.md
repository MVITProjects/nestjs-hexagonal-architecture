# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
npm run start:dev          # nest start --watch
npm run build              # nest build (deletes dist first)
npm run lint               # oxlint --type-aware src/ test/
npm run format             # prettier on src/ and test/
npm test                   # vitest unit tests (test/**/*.spec.ts, excludes test/e2e)
npx vitest run test/src/users/application/service/user.service.spec.ts   # single file
npx vitest run -t "creates a user"                                       # single test by name
npm run test:e2e           # vitest with vitest.config.e2e.ts (test/e2e/**/*.e2e-spec.ts)
npm run prisma:migrate     # prisma migrate dev
npm run prisma:generate    # regenerate client (also runs on postinstall)
```

## Stack notes

- NestJS 12, ESM (`"type": "module"`, `module: nodenext`): **relative imports must end in `.js`** even for `.ts` sources.
- Prisma 7 with SQLite via `@prisma/adapter-better-sqlite3`. The client is generated into `src/generated/prisma` (git-tracked output of `prisma generate`; don't edit). The DB URL comes from `DATABASE_URL` (falls back to `file:./dev.db`); `prisma.config.ts` reads it from `.env`.
- Tests use Vitest (not Jest) with globals enabled; lint is oxlint (not ESLint).
- `src/main.ts` uses top-level await for bootstrap.

## Architecture: hexagonal, vertical slices

Each feature lives in `src/<feature>/` following `src/users/`:

- `domain/` — pure TS entities and exceptions. Must not import `@nestjs/*` or `generated/prisma`.
- `application/port/in/` — use-case ports (one abstract class per use case); `application/port/out/` — driven ports (e.g. `UserRepositoryPort`); `application/service/` — a single service implementing the in-ports.
- `infrastructure/adapter/in/rest/` — controller, DTOs + mapper, exception filter. `infrastructure/adapter/out/persistence/prisma/` — Prisma adapter, persistence entity and mapper.
- `<feature>.module.ts` is the composition root: binds each port to its implementation (`{ provide: CreateUserUseCase, useExisting: UserService }`, `{ provide: UserRepositoryPort, useClass: PrismaUserRepositoryAdapter }`).

Dependency rule: `infrastructure` → `application` → `domain`, never the reverse. Ports are **abstract classes, not interfaces**, so they serve as Nest DI tokens. Shared technical code (e.g. `PrismaService`/`PrismaModule`) lives in `src/shared/infrastructure/` (Prisma setup in `config/prisma/`).

Domain exceptions (e.g. `UserNotFoundException`) are mapped to HTTP statuses in the feature's `global-exception.handler.ts` filter — add new exceptions to both its `@Catch` list and status mapping.

### Testing layout

Unit tests live under `test/` mirroring `src/` (not co-located). Services are tested by constructing them directly with an in-memory port adapter (`test/src/users/infrastructure/adapter/out/persistence/in-memory/`) instead of Nest's DI or a DB.

## Observability

Production telemetry is meant to go to NestJS Observe, but `ObserveModule` is not registered in `src/app.module.ts` yet (`npx @nestjs/observe link` sets it up and writes `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET` to `.env`). For tasks depending on production behavior (errors, slow endpoints, release regressions), use the Observe MCP server (`claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`) or the dashboard's "Copy agent prompt" output rather than reasoning from code alone.
