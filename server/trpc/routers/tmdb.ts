import { TRPCError } from "@trpc/server";
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
			try {
				return await tmdb<TMDbMovieSearch>("/search/movie", {
					query: {
						query: input.title,
					},
				});
			} catch (err) {
				logger.error(err);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch movies from TMDb",
					cause: err instanceof Error ? err.message : "Unknown error",
				});
			}
		}),
});
