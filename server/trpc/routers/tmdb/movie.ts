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
				total: tmdbMovies.total_results,
				results: movies,
			};
		}),

	details: protectedProcedure
		.input(
			z.object({
				movieId: ServerTmdbMovieValidation.id,
			}),
		)
		.output(
			z.object({
				details: TmdbMovieDetailsSchema,
				credits: z.array(TmdbMovieCreditSchema),
				saga: TmdbMovieSagaSchema.optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Get the movie details and credits from TMDB in parallel
			const [detailsResponse, creditsResponse] = await Promise.all([
				useCache(`tmdb:movie:${input.movieId}:details`, () =>
					tmdb(`/movie/${input.movieId}`, { schema: TmdbMovieDetailsResponseSchema }),
				),
				useCache(`tmdb:movie:${input.movieId}:credits`, () =>
					tmdb(`/movie/${input.movieId}/credits`, { schema: TmdbMovieCreditsResponseSchema }),
				),
			]);

			// Compute the details and credits responses to filter and format the properties
			const credits = creditsResponse.cast?.filter((x) => !!x) ?? [];
			const details = {
				...detailsResponse,
				genres:
					detailsResponse.genres
						?.filter((x): x is NonNullable<typeof x> & { name: string } => !!x?.name?.trim())
						.map((x) => x.name.trim()) ?? [],
			};

			let saga = undefined;

			// If the movie belongs to a saga, get the saga details from TMDB
			if (detailsResponse.belongs_to_collection?.id) {
				const collectionId = detailsResponse.belongs_to_collection.id;

				// Get the collection details from TMDB
				const sagaResponse = await useCache(`tmdb:movie:saga:${collectionId}`, () =>
					tmdb(`/collection/${collectionId}`, {
						schema: TmdbMovieCollectionResponseSchema,
					}),
				);

				// Get the external IDs of the movies in the saga
				const externalIds = sagaResponse.parts?.filter((x) => !!x).map((x) => x.id) ?? [];

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

				// Merge the TMDB collection movies with the user's movies
				saga = {
					...sagaResponse,
					movies:
						sagaResponse.parts
							?.filter((x): x is NonNullable<typeof x> => !!x)
							?.filter((p) => p.media_type === "movie")
							?.map((x) => Object.assign(x, { internal_movie: myMoviesMap.get(x.id) }))
							?.sort((a, b) => {
								if (!a.release_date && !b.release_date) {
									return 0;
								}
								if (!a.release_date) {
									return 1;
								}
								if (!b.release_date) {
									return -1;
								}
								return a.release_date.localeCompare(b.release_date);
							}) ?? [],
				};
			}

			return {
				details,
				credits,
				saga,
			};
		}),
});
