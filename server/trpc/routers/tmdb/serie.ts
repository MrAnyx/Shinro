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

			const tmdbSeries = await tmdb("/search/tv", {
				schema: TmdbSerieSearchResponseSchema,
				query: {
					query: input.search,
					page: input.page,
				},
			});

			const externalIds = tmdbSeries.results.map((x) => x.id);

			const mySeries = await prisma.serie.findMany({
				where: {
					media: {
						ownerId: ctx.user.id,
						externalId: {
							in: externalIds,
						},
					},
				},
				select: {
					id: true,
					media: {
						select: {
							externalId: true,
						},
					},
				},
			});

			const mySeriesMap = new Map(mySeries.map((m) => [m.media.externalId, m.id]));

			const series = tmdbSeries.results.map((serie) =>
				Object.assign(serie, { internalId: mySeriesMap.get(serie.id) }),
			);

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
		.output(TmdbSerieDetailsDefaultViewSchema)
		.query(async ({ input }) => {
			return await tmdb(`/tv/${input.id}`, {
				schema: TmdbSerieDetailsResponseSchema,
			});
		}),

	credits: protectedProcedure
		.input(
			z.object({
				id: ServerTmdbSerieValidation.id,
			}),
		)
		.output(TmdbSerieCreditsDefaultViewSchema)
		.query(async ({ input }) => {
			return await tmdb(`/tv/${input.id}/credits`, {
				schema: TmdbSerieCreditsResponseSchema,
			});
		}),
});
