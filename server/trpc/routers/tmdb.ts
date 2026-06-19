import z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

const logger = useLogger("tmdb");

export const tmdbRouter = router({
	movies: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				page: z.number().default(1),
			}),
		)
		.output(TMDbMovieSearchSchema)
		.query(async ({ input }) => {
			return await tmdb<TMDbMovieSearch>("/search/movie", {
				query: {
					query: input.title,
				},
			});
		}),
});
