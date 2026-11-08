import { z } from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	search: protectedProcedure
		.input(z.object({ search: ServerPaginationValidation.search, page: ServerPaginationValidation.page }))
		.output(PaginatedSchema(TmdbSerieSearchSchema))
		.query(async ({ input, ctx }) => {
			if (!input.search) {
				return { total: 0, results: [] };
			}
			const response = await useCache(`tmdb:serie:search:${input.search}:${input.page}`, () =>
				tmdb("/search/tv", {
					schema: TmdbSerieSearchResponseSchema,
					query: { query: input.search, page: input.page },
				}),
			);
			const results = response.results?.filter((item) => !!item) ?? [];
			const saved = await prisma.serie.findMany({
				where: { media: { ownerId: ctx.user.id, externalId: { in: results.map((item) => item.id) } } },
				include: { media: true },
			});
			const savedById = new Map(saved.map((item) => [item.media.externalId, item]));
			return {
				total: response.total_results ?? 0,
				results: results.map((item) => Object.assign({}, item, { internal_serie: savedById.get(item.id) })),
			};
		}),
});
