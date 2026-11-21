# Shinro Agent Instructions

This is the single source of guidance for all coding agents (GitHub Copilot, Codex, Cursor, Claude, and others) working in this repository. Do not duplicate it in tool-specific instruction files.

## Project Context

- Client-rendered Nuxt 4 SPA (`ssr: false`) using Vue, Nuxt UI, Pinia, Tailwind 4, tRPC 11, Prisma 7 (PostgreSQL via `@prisma/adapter-pg`), and Redis.
- Shinro is self-hosted: each instance is deployed and operated by its own administrator. Keep features configurable through environment variables, keep third-party or hosted services optional, and keep deployment simple.
- Use `pnpm` and follow the versions recorded in `package.json` and `pnpm-lock.yaml`.
- Preserve existing project conventions, public APIs, and user changes. Keep edits focused.

## Required Workflow

- Before changing code, inspect the owning implementation and nearby validation or usage patterns.
- Prefer existing components, composables, stores, utilities, server routers, and validation schemas over new abstractions.
- Validate behavior at the appropriate boundary. Client-side validation must not replace server-side validation.
- Never run `db:reset` or destructive migrations against production. Use an isolated or disposable database for migrations and reset operations.
- Do not commit changes or create branches unless explicitly requested.

## Commands

Use `pnpm clean-install` (the CI command) or `pnpm install` for local work.

```bash
pnpm dev             # Nuxt dev server at http://localhost:3000
pnpm build           # production build
pnpm lint            # oxlint            (pnpm lint:fix to autofix)
pnpm fmt             # oxfmt --check     (pnpm fmt:fix to write)
pnpm typecheck       # nuxi typecheck (vue-tsc)
pnpm db:generate     # regenerate Prisma client into lib/prisma/ after schema changes
pnpm db:migrate      # prisma migrate dev (create/apply a development migration)
```

- CI (`.github/workflows/ci.yaml`) runs `db:generate`, `lint`, `fmt`, then `typecheck`. The husky pre-commit hook runs `pnpm lint` and `pnpm fmt`.
- There is no automated test suite and no single-test command. Validate changes with lint, fmt, and typecheck (narrowest first, then broaden) and the manual checks in `RELEASE_CHECKLIST.md`.
- For schema changes, run `pnpm db:migrate` and `pnpm db:generate`, review the generated migration, and test it against a disposable database before release validation.

## Architecture

- **Request flow:** `app/plugins/trpc.ts` provides the typed client, exposed through `useTrpc()`. It calls `server/api/trpc/[trpc].ts`, which serves `appRouter` from `server/trpc/router.ts`. That router composes feature routers from `server/trpc/routers/` (`tmdb/movie.ts` is mounted as `tmdbMovie`). Client and server share one devalue transformer (`shared/utils/serializer.ts`).
- **Auth:** `server/trpc/init.ts` defines `publicProcedure`, `protectedProcedure`, and `adminProcedure`. `protectedProcedure` hashes the HttpOnly `session_id` cookie, loads the `Session`, rejects expired sessions (fixed lifetime from `SESSION_LIFETIME_DAYS`, equal to the cookie `maxAge`, no sliding expiration), and exposes `ctx.user` (`id`, `role`). The scheduled Nitro task `session:cleanup` runs daily at 03:00 (`nuxt.config.ts`).
- **First admin:** `register` always creates `USER` accounts. At boot, if no ADMIN exists, `server/plugins/adminSetup.ts` logs a one-time setup token whose SHA-256 hash is stored in Redis with `ADMIN_SETUP_TOKEN_TTL` (`server/utils/adminSetup.ts`). A signed-in user redeems it through `user.claimAdmin` (Settings > Profile); the claim takes a Postgres advisory lock so only one account becomes the first ADMIN.
- **Routers own their data access.** They query Prisma directly through `server/utils/prisma.ts`; keep queries inline and do not add a repository or service layer. Every user-owned read or write must filter by `ctx.user.id`. Each procedure declares a Zod `.input()` and `.output()`.
- **Caching:** `useCache(key, fn, { ttl, prefix })` in `server/utils/cache.ts` caches results in Redis-backed Nitro storage (`redis:` is mounted by `server/plugins/redisStorage.ts`). TMDb calls go through `server/utils/tmdb.ts`.
- **Prisma:** the schema and migrations live in `server/prisma/` (configured in `prisma.config.ts`). The generated client in `lib/prisma/` is imported as `#prisma/client`; never edit it. With strict undefined checks enabled, use `Prisma.skip` instead of `undefined` for omitted optional update fields.
- Seasons and episodes have been removed from the product and schema. Do not reintroduce them or extend series unless requested.

## Validation and Type Layering

Zod schemas are split into three layers:

1. `shared/utils/<entity>.models.ts` and `<entity>.validations.ts` define the base schemas (`*SchemaBase`, `*Schema`). Inferred types live in the parallel files under `shared/types/*.d.ts`.
2. `server/utils/<entity>.validations.ts` exports `Server<Entity>Validation` objects. These add server-only rules such as transforms, Prisma enums, and pagination.
3. `app/utils/<entity>.validations.ts` exports `Client<Entity>Validation` objects for forms.

Client validation never replaces server validation. Client stores type their procedure inputs and outputs with `TRPCProcedureInput` and `TRPCProcedureOutput` from `app/utils/trpc.ts`.

## Environment and Feature Flags

- Server env vars are validated once with Zod in `server/utils/serverEnv.ts`. Import `serverEnv` instead of reading `process.env` (oxlint enforces this). Parsing is skipped when `CI` is set. When adding a variable, update `serverEnvSchema`, `.env.example`, and the env list in `RELEASE_CHECKLIST.md`.
- Public flags (`NUXT_PUBLIC_ALLOW_REGISTRATION` and `NUXT_PUBLIC_ENABLE_{MOVIES,SERIES,MUSICS,BOOKS,GAMES}`) map to `runtimeConfig.public` in `nuxt.config.ts`. On the client they are read with `useClientConfig()` (schema in `app/utils/clientEnv.ts`), and pages are gated by the matching route middleware (`app/middleware/movies.ts`, `register.ts`, and so on).

## Frontend Conventions

- Pages, middleware, composables, components, and stores under `app/` use Nuxt auto-imports. Components in subfolders get prefixed names, so `components/details/Overview.vue` is used as `<DetailsOverview>`. `server/utils` exports are also auto-imported on the server (`serverEnv`, `prisma`, `useCache`, and others). Use the `#server/...`, `#prisma/...`, and `#lib/...` aliases for explicit imports.
- Fetch browser-only tRPC data with `useClientAsyncData()`, which is lazy and client-only and sends unhandled errors to the status toast. Use `getTRPCErrorCode()` to branch on expected codes such as `NOT_FOUND` rather than treating them as generic errors.
- For UI values changed through a tRPC query or mutation, use a writable computed together with `usePendingValue()`. The getter reads `isPending` / `value` and falls back to the server-derived value when idle; the setter calls `track(value, update)`, so the new value displays immediately while the request is in flight. Do not hand-roll optimistic state.
- Movie details come from `movie.getInternalDetails` or `movie.getExternalDetails`. Both return the common `MovieDetailsSchema` (`movie`, `details`, `credits`, `saga`, `collections`), and the page `pages/app/(media)/movies/[type]/[movieId]` selects one by the route's `type`.

## Skills

- For tasks matching a repository skill, read its `SKILL.md` and follow its instructions, loading only the references relevant to the task.
- `nuxt-ui` (`.agents/skills/nuxt-ui/SKILL.md`): use when creating or changing interfaces built with Nuxt UI, including components, forms, theming, and layouts.

## Feature and Improvement Checklist Rule

Every feature or improvement must update `RELEASE_CHECKLIST.md` with explicit, testable release checks in the same change. Cover applicable edge cases, failure states, permissions, feature flags, migrations, and responsive and accessibility behavior. The work is not complete until the checklist update is included and the affected checks have been validated.

## Code Style

- Follow the existing TypeScript, Vue, Nuxt, and Prisma patterns.
- oxfmt formatting: tabs, 120 columns, double quotes, semicolons, LF line endings, and sorted imports. oxlint treats correctness and performance rules as errors.
- TypeScript runs with `strict` and `exactOptionalPropertyTypes`.
- Keep code self-explanatory; add comments only when they clarify non-obvious decisions.
- Use ASCII by default for new text.
- Keep user-facing errors useful without exposing secrets, credentials, stack traces, or internal details. Production `INTERNAL_SERVER_ERROR` messages are already masked in `server/trpc/init.ts`.
