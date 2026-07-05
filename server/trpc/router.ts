import { router } from "#server/trpc/init";
import collectionRouter from "#server/trpc/routers/collections";
import movieRouter from "#server/trpc/routers/movies";
import tmdbRouter from "#server/trpc/routers/tmdb";
import userRouter from "#server/trpc/routers/users";

export const appRouter = router({
	users: userRouter,
	tmdb: tmdbRouter,
	collections: collectionRouter,
	movies: movieRouter,
});

export type AppRouter = typeof appRouter;
