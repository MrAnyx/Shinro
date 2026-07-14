import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { Prisma } from "~~/server/prisma/generated/client";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	movies: protectedProcedure
		.input(
			z.object({
				search: z.string().min(1),
				page: z.number().default(1),
			}),
		)
		.output(PaginatedSchema(TmdbMovieSearchDefaultViewSchema))
		.query(async ({ input }) => {
			try {
				const tmdbMovies = await tmdb("/search/movie", {
					schema: TmdbMovieSearchResponseSchema,
					query: {
						query: input.search,
						page: input.page,
					},
				});

				const ids = tmdbMovies.results.map((x) => x.id);

				const myMovies = await prisma.movie.findMany({
					where: {
						externalId: {
							in: ids,
						},
					},
					select: {
						id: true,
						externalId: true,
					},
				});

				const myMoviesMap = new Map(myMovies.map((m) => [m.id, m.externalId]));

				const movies = tmdbMovies.results.map((movie) => ({
					...movie,
					internalId: myMoviesMap.get(movie.id) ?? undefined,
				}));

				return {
					total: tmdbMovies.total_results,
					results: movies,
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
