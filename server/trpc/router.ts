import { router } from "#server/trpc/init";
import collectionRouter from "#server/trpc/routers/collection";
import mediaRouter from "#server/trpc/routers/media";
import movieRouter from "#server/trpc/routers/movie";
import tmdbRouter from "#server/trpc/routers/tmdb";
import userRouter from "#server/trpc/routers/user";

export const appRouter = router({
	user: userRouter,
	tmdb: tmdbRouter,
	collection: collectionRouter,
	movie: movieRouter,
	media: mediaRouter,
});

export type AppRouter = typeof appRouter;
