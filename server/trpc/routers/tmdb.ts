import { TRPCError } from "@trpc/server";
import z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

const logger = useLogger("trpc:tmdb");

export const tmdbRouter = router({
	movies: protectedProcedure
		.input(
			z.object({
				search: z.string().min(1),
				page: z.number().default(1),
			}),
		)
		.output(PaginatedSchema(TMDbMovieSchema.model))
		.query(async ({ input }) => {
			try {
				const movies = await tmdb<TMDbMovieSearch>("/search/movie", {
					query: {
						query: input.search,
						page: input.page,
					},
				});

				return {
					results: movies.results,
					total: movies.total_results,
				};
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movies",
				});
			}
		}),
});
