# Shinro Copilot Instructions

`AGENT.md` at the repo root holds the full agent guidance. This file summarizes it and adds cross-file details. Keep the two files in sync.

## Commands

Use `pnpm` (CI installs with `pnpm clean-install`).

```bash
pnpm dev            # Nuxt dev server at http://localhost:3000
pnpm build          # production build
pnpm lint           # oxlint            (pnpm lint:fix to autofix)
pnpm fmt            # oxfmt --check     (pnpm fmt:fix to write)
pnpm typecheck      # nuxi typecheck (vue-tsc)
pnpm db:generate    # regenerate Prisma client into lib/prisma/ after schema changes
pnpm db:migrate     # prisma migrate dev (create/apply a dev migration)
```

- CI (`.github/workflows/ci.yaml`) runs `db:generate`, `lint`, `fmt`, then `typecheck`. The husky pre-commit hook runs `pnpm lint` and `pnpm fmt`.
- There is no automated test suite and no single-test command. Validate changes with lint/fmt/typecheck and the manual checks in `RELEASE_CHECKLIST.md`.
- Never run `db:reset` or destructive migrations against production. Use a disposable database.

## Architecture

- Nuxt 4 SPA (`ssr: false`) with Nuxt UI, Pinia, Tailwind 4, tRPC 11, Prisma 7 (PostgreSQL via `@prisma/adapter-pg`), and Redis. The app is self-hosted, so features must be configurable through environment variables and third-party services must stay optional.
- **Request flow:** `app/plugins/trpc.ts` provides the typed client, exposed through `useTrpc()`. It calls `server/api/trpc/[trpc].ts`, which serves `appRouter` from `server/trpc/router.ts`. That router composes feature routers from `server/trpc/routers/` (`tmdb/movie.ts` is mounted as `tmdbMovie`). Client and server share one devalue transformer (`shared/utils/serializer.ts`).
- **Auth:** `server/trpc/init.ts` defines `publicProcedure`, `protectedProcedure`, and `adminProcedure`. `protectedProcedure` hashes the HttpOnly `session_id` cookie, loads the `Session`, rejects expired sessions, extends the session expiry on every call, and exposes `ctx.user` (`id`, `role`). The scheduled Nitro task `session:cleanup` runs daily at 03:00 (`nuxt.config.ts`).
- **Routers own their data access.** They query Prisma directly through `server/utils/prisma.ts`; do not add a repository or service layer. Every user-owned read or write must filter by `ctx.user.id`. Each procedure declares a Zod `.input()` and `.output()`.
- **Caching:** `useCache(key, fn, { ttl, prefix })` in `server/utils/cache.ts` caches results in Redis-backed Nitro storage (`redis:` is mounted by `server/plugins/redisStorage.ts`). TMDb calls go through `server/utils/tmdb.ts`.
- **Prisma:** the schema and migrations live in `server/prisma/` (configured in `prisma.config.ts`). The generated client in `lib/prisma/` is imported as `#prisma/client`; never edit it. With strict undefined checks enabled, use `Prisma.skip` instead of `undefined` for omitted optional update fields.

## Validation and type layering

Zod schemas are split into three layers:

1. `shared/utils/<entity>.models.ts` and `<entity>.validations.ts` define the base schemas (`*SchemaBase`, `*Schema`). Inferred types live in the parallel files under `shared/types/*.d.ts`.
2. `server/utils/<entity>.validations.ts` exports `Server<Entity>Validation` objects. These add server-only rules such as transforms, Prisma enums, and pagination.
3. `app/utils/<entity>.validations.ts` exports `Client<Entity>Validation` objects for forms.

Client validation never replaces server validation. Client stores type their procedure inputs and outputs with `TRPCProcedureInput` and `TRPCProcedureOutput` from `app/utils/trpc.ts`.

## Environment and feature flags

- Server env vars are validated once with Zod in `server/utils/serverEnv.ts`. Import `serverEnv` instead of reading `process.env` (oxlint enforces this). Parsing is skipped when `CI` is set. When adding a variable, update `serverEnvSchema`, `.env.example`, and the env list in `RELEASE_CHECKLIST.md`.
- Public flags (`NUXT_PUBLIC_ALLOW_REGISTRATION` and `NUXT_PUBLIC_ENABLE_{MOVIES,SERIES,MUSICS,BOOKS,GAMES}`) map to `runtimeConfig.public` in `nuxt.config.ts`. On the client they are read with `useClientConfig()` (schema in `app/utils/clientEnv.ts`), and pages are gated by the matching route middleware (`app/middleware/movies.ts`, `register.ts`, and so on).
- The product scope excludes series, seasons, and episodes. Do not extend them unless asked.

## Frontend conventions

- `app/` uses Nuxt auto-imports. Components in subfolders get prefixed names, so `components/details/Overview.vue` is used as `<DetailsOverview>`. `server/utils` exports are also auto-imported on the server (`serverEnv`, `prisma`, `useCache`, and others). Use the `#server/...`, `#prisma/...`, and `#lib/...` aliases for explicit imports.
- Fetch browser-only tRPC data with `useClientAsyncData()`, which is lazy and client-only and sends unhandled errors to the status toast. Use `getTRPCErrorCode()` to branch on expected codes such as `NOT_FOUND`.
- For UI values changed through tRPC, use a writable computed together with `usePendingValue()`. The getter shows the pending value while a request is in flight and falls back to the server value when idle. The setter calls `track(value, update)`. Do not hand-roll optimistic state.
- Movie details come from `movie.getInternalDetails` or `movie.getExternalDetails`. Both return `MovieDetailsSchema`, and the page `pages/app/(media)/movies/[type]/[movieId]` selects one by the route's `type`.
- For Nuxt UI work, follow the repository skill in `.agents/skills/nuxt-ui/SKILL.md`.

## Required for every feature or improvement

Add explicit, testable checks to `RELEASE_CHECKLIST.md` in the same change. Cover edge cases, failure states, permissions, feature flags, migrations, and responsive and accessibility behavior where they apply.

## Style

- oxfmt formatting: tabs, 120 columns, double quotes, semicolons, LF line endings, sorted imports. oxlint treats correctness and performance rules as errors.
- TypeScript runs with `strict` and `exactOptionalPropertyTypes`.
- Use ASCII for new text. User-facing errors must not expose secrets or internal details; production `INTERNAL_SERVER_ERROR` messages are already masked in `init.ts`.
- Do not commit or create branches unless asked.
