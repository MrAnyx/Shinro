import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	search: protectedProcedure
		.input(
			z.object({
				search: ServerPaginationValidation.search,
				page: ServerPaginationValidation.page,
			}),
		)
		.output(PaginatedSchema(TmdbMovieSearchDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			try {
				if (!input.search) {
					return {
						total: 0,
						results: [],
					};
				}

				const tmdbMovies = await tmdb("/search/movie", {
					schema: TmdbMovieSearchResponseSchema,
					query: {
						query: input.search,
						page: input.page,
					},
				});

				const externalIds = tmdbMovies.results.map((x) => x.id);

				const myMovies = await prisma.movie.findMany({
					where: {
						ownerId: ctx.user.id,
						externalId: {
							in: externalIds,
						},
					},
					select: {
						id: true,
						externalId: true,
					},
				});

				const myMoviesMap = new Map(myMovies.map((m) => [m.externalId, m.id]));

				const movies = tmdbMovies.results.map((movie) => ({
					...movie,
					internalId: myMoviesMap.get(movie.id),
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

	details: protectedProcedure
		.input(
			z.object({
				id: ServerTmdbMovieValidation.id,
			}),
		)
		.output(TmdbMovieDetailsDefaultViewSchema)
		.query(async ({ input }) => {
			try {
				const movie = await tmdb(`/movie/${input.id}`, {
					schema: TmdbMovieDetailsResponseSchema,
				});

				return movie;
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movies",
				});
			}
		}),
});
