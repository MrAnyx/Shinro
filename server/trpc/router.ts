import { router } from "#server/trpc/init";
import cacheRouter from "#server/trpc/routers/cache";
import collectionRouter from "#server/trpc/routers/collection";
import mediaRouter from "#server/trpc/routers/media";
import movieRouter from "#server/trpc/routers/movie";
import tmdbMovieRouter from "#server/trpc/routers/tmdb/movie";
import userRouter from "#server/trpc/routers/user";

export const appRouter = router({
	user: userRouter,
	tmdbMovie: tmdbMovieRouter,
	collection: collectionRouter,
	cache: cacheRouter,
	movie: movieRouter,
	media: mediaRouter,
});

export type AppRouter = typeof appRouter;
