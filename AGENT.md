# Shinro Agent Instructions

## Project Context

- Shinro is a Nuxt application using Vue, Pinia, tRPC, Prisma, PostgreSQL, and Redis.
- Use `pnpm` and follow the versions recorded in `package.json` and `pnpm-lock.yaml`.
- Preserve existing project conventions, public APIs, and user changes. Keep edits focused.

## Required Workflow

- Before changing code, inspect the owning implementation and nearby validation or usage patterns.
- Prefer existing components, composables, stores, utilities, server routers, and validation schemas over new abstractions.
- Validate behavior at the appropriate boundary. Client-side validation must not replace server-side validation.
- Do not run destructive database commands against production. Use an isolated or disposable database for migrations and reset operations.
- Do not commit changes or create branches unless explicitly requested.

## Architecture Conventions

- tRPC routers live in `server/trpc/routers` and query Prisma inline. Do not add a repository or service layer for procedure queries.
- Zod schemas shared by client and server live in `shared/utils/*.models.ts`, with inferred types in `shared/types/*.models.d.ts`.
- Movie details use dedicated procedures, `movie.getInternalDetails` and `movie.getExternalDetails`. Both return the common `MovieDetailsSchema` (`movie`, `details`, `credits`, `saga`, `collections`), and the details page picks one by route type.
- Serie, season, and episode features were removed. Do not reintroduce them unless requested.
- Use `useTrpc()` for client calls and `getTRPCErrorCode()` to handle expected errors such as `NOT_FOUND`.

## Feature And Improvement Checklist Rule

For every new feature or improvement:

1. Update `RELEASE_CHECKLIST.md` in the same change.
2. Add or revise the relevant verification item so the changed behavior has an explicit, testable release check.
3. Include important edge cases, failure states, permissions, feature flags, migrations, and responsive or accessibility behavior when they apply.
4. Do not consider the feature or improvement complete until the checklist update is included and the affected checks have been validated.

## Validation Commands

Run the narrowest relevant checks first, then broaden as needed:

- `pnpm lint`
- `pnpm fmt`
- `pnpm typecheck`

For database schema changes, review the generated migration and test it against a disposable database before release validation.

## Code Style

- Follow the existing TypeScript, Vue, Nuxt, and Prisma patterns.
- Keep code self-explanatory; add comments only when they clarify non-obvious decisions.
- Use ASCII by default for new text.
- Keep user-facing errors useful without exposing secrets, credentials, stack traces, or internal implementation details.
