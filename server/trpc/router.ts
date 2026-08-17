import { router } from "#server/trpc/init";
import collectionRouter from "#server/trpc/routers/collection";
import mediaRouter from "#server/trpc/routers/media";
import movieRouter from "#server/trpc/routers/movie";
import serieRouter from "#server/trpc/routers/serie";
import tmdbMovieRouter from "#server/trpc/routers/tmdb/movie";
import tmdbSerieRouter from "#server/trpc/routers/tmdb/serie";
import userRouter from "#server/trpc/routers/user";

export const appRouter = router({
	user: userRouter,
	tmdbMovie: tmdbMovieRouter,
	tmdbSerie: tmdbSerieRouter,
	collection: collectionRouter,
	movie: movieRouter,
	media: mediaRouter,
	serie: serieRouter,
});

export type AppRouter = typeof appRouter;
