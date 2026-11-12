# Shinro Agent Instructions

## Project Context

- This is a client-rendered Nuxt 4 application (`ssr: false`) using Vue, Nuxt UI, Pinia, Tailwind, tRPC, Prisma, PostgreSQL, and Redis.
- Shinro is designed to be self-hosted: each instance is deployed and operated by its own administrator. Keep features configurable through environment variables, avoid dependencies on hosted or third-party services unless they are optional, and keep deployment simple.
- Use `pnpm` and follow the versions recorded in `package.json` and `pnpm-lock.yaml`.
- Preserve existing project conventions, public APIs, and user changes. Keep edits focused.
- Pages, middleware, composables, components, and stores under `app/` use Nuxt auto-imports.

## Required Workflow

- Before changing code, inspect the owning implementation and nearby validation or usage patterns.
- Prefer existing components, composables, stores, utilities, server routers, and validation schemas over new abstractions.
- Validate behavior at the appropriate boundary. Client-side validation must not replace server-side validation.
- Do not run destructive database commands against production. Use an isolated or disposable database for migrations and reset operations; never run `db:reset` or destructive migration commands against production.
- Do not commit changes or create branches unless explicitly requested.

## Skills

- For tasks matching a repository skill, read its `SKILL.md` and follow its instructions, loading only the relevant references for the task.
- `nuxt-ui` (`.agents/skills/nuxt-ui/SKILL.md`): use when creating or changing interfaces built with Nuxt UI, including components, forms, theming, and layouts.

## Architecture Conventions

- Browser calls go through the typed tRPC client supplied by `app/plugins/trpc.ts`, exposed by `useTrpc()`, to the `/api/trpc` Nitro handler. `server/trpc/router.ts` composes feature routers.
- Server routers in `server/trpc/routers/` own procedures and query Prisma directly. Use `publicProcedure`, `protectedProcedure`, or `adminProcedure` from `server/trpc/init.ts`; protected procedures authenticate the HttpOnly `session_id` cookie and provide `ctx.user`. Keep router queries inline; do not introduce a repository or service layer for procedures.
- Validate inputs and declare Zod outputs at the tRPC boundary. Every user-owned read or mutation must constrain ownership with `ctx.user.id`.
- PostgreSQL schema and migrations live in `server/prisma/`. Prisma generates its client into `lib/prisma/`; do not edit generated files. The server configures Prisma with the PostgreSQL adapter in `server/utils/prisma.ts`; Redis is mounted as Nitro storage at `redis:` by `server/plugins/redisStorage.ts`.
- Shared Zod models and validations live in `shared/utils/*.models.ts` and `shared/utils/*.validations.ts`, with inferred types in the parallel `shared/types/*.d.ts` files.
- Client stores use `TRPCProcedureInput`/`TRPCProcedureOutput` from `app/utils/trpc.ts` to stay aligned with router procedures.
- For optional Prisma updates, default omitted inputs to `Prisma.skip` rather than writing `undefined`; Prisma strict undefined checks are enabled.
- Pages that fetch browser-only tRPC data use `useClientAsyncData()`, which is lazy and client-only and routes unhandled errors to the status toast. Use `getTRPCErrorCode()` to branch on expected failures such as `NOT_FOUND`, rather than treating them as generic errors.
- Movie detail procedures are `movie.getInternalDetails` and `movie.getExternalDetails`. Both return the common `MovieDetailsSchema` (`movie`, `details`, `credits`, `saga`, `collections`), and the details page selects the procedure by route source type.
- The documented product scope excludes series, seasons, and episodes. Do not reintroduce or extend those features unless requested.
- When a value shown in the UI is changed through a tRPC query or mutation, keep a writable computed and use `usePendingValue()`: read `isPending` / `value` in the getter (falling back to the server-derived value when idle) and call `track(value, update)` in the setter, so the new value displays immediately while the request is in flight. Do not hand-roll optimistic state.

## Feature And Improvement Checklist Rule

Every feature or improvement must update `RELEASE_CHECKLIST.md` with an explicit, testable release check in the same change. Include applicable edge cases, failure states, permissions, feature flags, migrations, and responsive or accessibility behavior. Do not consider the work complete until the checklist update is included and the affected checks have been validated.

## Commands

Use `pnpm clean-install` (the CI command) or `pnpm install` for local work.

```bash
pnpm dev             # start Nuxt at http://localhost:3000
pnpm build           # production build
pnpm lint            # oxlint
pnpm fmt             # check formatting with oxfmt
pnpm typecheck       # Nuxt/TypeScript type check
pnpm db:generate     # regenerate Prisma client after schema changes
pnpm db:migrate      # create/apply a development migration
```

CI runs `pnpm db:generate`, `pnpm lint`, `pnpm fmt`, and `pnpm typecheck`. There is currently no test script or tracked automated test suite, so there is no single-test command. Run the narrowest relevant checks first, then broaden as needed.

For database schema changes, use `pnpm db:generate`, review the generated migration, and test it against an isolated or disposable database before release validation.

## Code Style

- Follow the existing TypeScript, Vue, Nuxt, and Prisma patterns.
- Formatting is enforced by oxfmt: 120 columns, semicolons, double quotes, LF endings, and automatically sorted imports.
- Oxlint treats correctness and performance rules as errors; avoid direct `process.env` access and use validated server configuration instead.
- Keep code self-explanatory; add comments only when they clarify non-obvious decisions.
- Use ASCII by default for new text.
- Keep user-facing errors useful without exposing secrets, credentials, stack traces, or internal implementation details.
