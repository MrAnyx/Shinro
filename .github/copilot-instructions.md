# Shinro Copilot Instructions

## Commands

Use pnpm. Install with `pnpm clean-install` (the CI command) or `pnpm install` for local work.

```bash
pnpm dev             # start Nuxt at http://localhost:3000
pnpm build           # production build
pnpm lint            # oxlint
pnpm fmt             # check formatting with oxfmt
pnpm typecheck       # Nuxt/TypeScript type check
pnpm db:generate     # regenerate Prisma client after schema changes
pnpm db:migrate      # create/apply a development migration
```

CI runs `pnpm db:generate`, `pnpm lint`, `pnpm fmt`, and `pnpm typecheck`. There is currently no test script or tracked automated test suite, so there is no single-test command. For database work, use an isolated or disposable PostgreSQL database; never use `db:reset` or destructive migration commands against production.

## Architecture

- This is a client-rendered Nuxt 4 application (`ssr: false`) using Vue, Nuxt UI, Pinia, and Tailwind. Pages, middleware, composables, components, and stores under `app/` use Nuxt auto-imports.
- Browser calls go through the typed tRPC client supplied by `app/plugins/trpc.ts`, exposed by `useTrpc()`, to the `/api/trpc` Nitro handler. `server/trpc/router.ts` composes the feature routers.
- Server routers in `server/trpc/routers/` own procedures and query Prisma directly. Use `publicProcedure`, `protectedProcedure`, or `adminProcedure` from `server/trpc/init.ts`; protected procedures authenticate the HttpOnly `session_id` cookie and provide `ctx.user`.
- PostgreSQL schema and migrations live in `server/prisma/`. Prisma generates its client into `lib/prisma/`; do not edit generated files. The server configures Prisma with the PostgreSQL adapter in `server/utils/prisma.ts`; Redis is mounted as Nitro storage at `redis:` by `server/plugins/redisStorage.ts`.
- Shared Zod models and validations live in `shared/utils/*.models.ts` and `shared/utils/*.validations.ts`. Their inferred TypeScript types live in the parallel `shared/types/*.d.ts` files. Client stores use `TRPCProcedureInput`/`TRPCProcedureOutput` from `app/utils/trpc.ts` to stay aligned with router procedures.

## Repository Conventions

- Keep tRPC router queries inline; do not introduce a repository or service layer for procedures. Validate inputs and declare Zod outputs at the tRPC boundary. Every user-owned read or mutation must constrain ownership with `ctx.user.id`.
- For optional Prisma updates, default omitted inputs to `Prisma.skip` rather than writing `undefined`; Prisma strict undefined checks are enabled.
- Pages that fetch browser-only tRPC data use `useClientAsyncData()`, which is lazy and client-only and routes unhandled errors to the status toast. For expected tRPC failures, branch on `getTRPCErrorCode()` (for example, `NOT_FOUND`) rather than treating them as generic errors.
- Movie detail procedures are split into `movie.getInternalDetails` and `movie.getExternalDetails`, but both return `MovieDetailsSchema`: `movie`, `details`, `credits`, `saga`, and `collections`. The detail page selects the procedure from the route source type.
- The documented product scope excludes series, seasons, and episodes. Do not reintroduce or extend those features unless the task explicitly requests it.
- Every feature or improvement must update `RELEASE_CHECKLIST.md` with an explicit, testable release check, including applicable failure states, permissions, flags, migrations, and responsive/accessibility behavior.
- Formatting is enforced by oxfmt: 120 columns, semicolons, double quotes, LF endings, and automatically sorted imports. Oxlint treats correctness and performance rules as errors; avoid direct `process.env` access and use validated server configuration instead.
