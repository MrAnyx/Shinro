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
		.output(PaginatedSchema(TmdbSerieSearchDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			if (!input.search) {
				return {
					total: 0,
					results: [],
				};
			}

			const tmdbSeries = await useCache(`tmdb:serie:search:${input.search}:${input.page}`, () =>
				tmdb("/search/tv", {
					schema: TmdbSerieSearchResponseSchema,
					query: {
						query: input.search,
						page: input.page,
					},
				}),
			);

			// Get the external IDs of the series found on TMDB
			const externalIds = tmdbSeries.results?.filter((x) => !!x)?.map((x) => x.id) ?? [];

			// Get the series that belong to the user and have the same external IDs
			const mySeries = await prisma.serie.findMany({
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
			const mySerieMap = new Map(mySeries.map((m) => [m.media.externalId, m]));

			// Merge the TMDB movies with the user's movies
			const series =
				tmdbSeries.results
					?.filter((x) => !!x)
					?.map((x) => Object.assign(x, { internal_serie: mySerieMap.get(x.id) })) ?? [];

			return {
				total: tmdbSeries.total_results,
				results: series,
			};
		}),

	details: protectedProcedure
		.input(
			z.object({
				id: ServerTmdbSerieValidation.id,
			}),
		)
		.output(
			z.object({
				details: TmdbSerieDetailsDefaultViewSchema,
				credits: z.array(TmdbSerieCreditDefaultViewSchema),
				seasons: z.array(TmdbSerieDetailsSeasonDefaultViewSchema),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Get the serie details and credits from TMDB in parallel
			const [detailsResponse, creditsResponse] = await Promise.all([
				useCache(`tmdb:serie:${input.id}:details`, () =>
					tmdb(`/tv/${input.id}`, { schema: TmdbSerieDetailsResponseSchema }),
				),
				useCache(`tmdb:serie:${input.id}:credits`, () =>
					tmdb(`/tv/${input.id}/credits`, { schema: TmdbSerieCreditsResponseSchema }),
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

			// Get the external IDs of the season in the collection
			const externalIds = detailsResponse.seasons?.filter((x) => !!x).map((x) => x.id) ?? [];

			// Get the seasons that belong to the user and have the same external IDs
			const mySeasons = await prisma.season.findMany({
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

			// Create a map of the user's seasons for easy lookup
			const mySeasonsMap = new Map(mySeasons.map((m) => [m.media.externalId, m]));

			// Merge the TMDB collection seasons with the user's seasons
			const seasons =
				detailsResponse.seasons
					?.filter((x): x is NonNullable<typeof x> => !!x)
					?.sort((a, b) => a.season_number - b.season_number)
					?.map((x) => Object.assign(x, { internal_season: mySeasonsMap.get(x.id) })) ?? [];

			return {
				details,
				seasons,
				credits,
			};
		}),
});
