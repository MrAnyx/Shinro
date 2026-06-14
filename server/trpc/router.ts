import { router } from "#server/trpc/init";
import { tmdbRouter } from "#server/trpc/routers/tmdb";
import { usersRouter } from "#server/trpc/routers/users";

export const appRouter = router({
	users: usersRouter,
	tmdb: tmdbRouter,
});

export type AppRouter = typeof appRouter;
