import { router } from "#server/trpc/init";
import { collectionRouter } from "#server/trpc/routers/collections";
import { tmdbRouter } from "#server/trpc/routers/tmdb";
import { userRouter } from "#server/trpc/routers/users";

export const appRouter = router({
	users: userRouter,
	tmdb: tmdbRouter,
	collections: collectionRouter,
});

export type AppRouter = typeof appRouter;
