import { z } from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	search: protectedProcedure
		.input(
			z.object({
				search: ServerPaginationValidation.search,
				page: ServerPaginationValidation.page,
			}),
		)
		.output(PaginatedSchema(TmdbMovieSearchSchema))
		.query(async ({ input, ctx }) => {
			if (!input.search) {
				return {
					total: 0,
					results: [],
				};
			}

			const tmdbMovies = await useCache(`tmdb:movie:search:${input.search}:${input.page}`, () =>
				tmdb("/search/movie", {
					schema: TmdbMovieSearchResponseSchema,
					query: {
						query: input.search,
						page: input.page,
					},
				}),
			);

			// Get the external IDs of the movies found on TMDB
			const externalIds = tmdbMovies.results?.filter((x) => !!x)?.map((x) => x.id) ?? [];

			// Get the movies that belong to the user and have the same external IDs
			const myMovies = await prisma.movie.findMany({
				where: {
					media: {
						ownerId: ctx.user.id,
						externalId: {
							in: externalIds,
						},
					},
				},
				include: {
					media: true,
				},
			});

			// Create a map of the user's movies for easy lookup
			const myMoviesMap = new Map(myMovies.map((m) => [m.media.externalId, m]));

			// Merge the TMDB movies with the user's movies
			const movies =
				tmdbMovies.results
					?.filter((x) => !!x)
					?.map((x) => Object.assign(x, { internal_movie: myMoviesMap.get(x.id) })) ?? [];

			return {
				total: tmdbMovies.total_results ?? 0,
				results: movies,
			};
		}),
});
