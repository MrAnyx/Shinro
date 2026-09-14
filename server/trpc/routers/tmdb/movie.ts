import { pipe, filter, map } from "es-toolkit/fp";
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
		.output(PaginatedSchema(TmdbMovieSearchDefaultViewSchema))
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
			const externalIds = pipe(
				tmdbMovies.results ?? [],
				filter((x) => !!x),
				map((x) => x.id),
			);

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
			const movies = pipe(
				tmdbMovies.results ?? [],
				filter((x) => !!x),
				map((x) => Object.assign(x, { internal_movie: myMoviesMap.get(x.id) })),
			);

			return {
				total: tmdbMovies.total_results,
				results: movies,
			};
		}),

	details: protectedProcedure
		.input(
			z.object({
				id: ServerTmdbMovieValidation.id,
			}),
		)
		.output(
			z.object({
				details: TmdbMovieDetailsDefaultViewSchema,
				credits: TmdbMovieCreditsDefaultViewSchema,
				saga: TmdbMovieCollectionDefaultViewSchema.optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Get the movie details and credits from TMDB in parallel
			const [details, credits] = await Promise.all([
				useCache(`tmdb:movie:details:${input.id}`, () =>
					tmdb(`/movie/${input.id}`, { schema: TmdbMovieDetailsResponseSchema }),
				),
				useCache(`tmdb:movie:credits:${input.id}`, () =>
					tmdb(`/movie/${input.id}/credits`, { schema: TmdbMovieCreditsResponseSchema }),
				),
			]);

			let saga = undefined;

			// If the movie belongs to a collection, get the collection details from TMDB
			if (details.belongs_to_collection?.id) {
				const collectionId = details.belongs_to_collection.id;

				// Get the collection details from TMDB
				saga = await useCache(`tmdb:movie:collection:${collectionId}`, () =>
					tmdb(`/collection/${collectionId}`, {
						schema: TmdbMovieCollectionResponseSchema,
					}),
				);

				// Get the external IDs of the movies in the collection
				const externalIds = saga.parts?.map((x) => x.id) ?? [];

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
				saga.parts =
					saga.parts?.map((part) => Object.assign(part, { internal_movie: myMoviesMap.get(part.id) })) ?? [];
			}

			return {
				details,
				credits,
				saga,
			};
		}),
});
