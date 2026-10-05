import { z } from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	details: protectedProcedure
		.input(
			z.object({
				serieId: ServerTmdbSerieValidation.id,
				seasonNumber: ServerTmdbSeasonValidation.number,
			}),
		)
		.output(TmdbSeasonDetailsSchema)
		.query(async ({ input, ctx }) => {
			const details = await useCache(`tmdb:serie:${input.serieId}:season:${input.seasonNumber}:details`, () =>
				tmdb(`/tv/${input.serieId}/season/${input.seasonNumber}`, { schema: TmdbSeasonDetailsResponseSchema }),
			);

			// // Get the external IDs of the season in the collection
			// const externalIds = details.seasons?.filter((x) => !!x).map((x) => x.id) ?? [];

			// // Get the seasons that belong to the user and have the same external IDs
			// const mySeasons = await prisma.season.findMany({
			// 	where: {
			// 		media: {
			// 			ownerId: ctx.user.id,
			// 			externalId: {
			// 				in: externalIds,
			// 			},
			// 		},
			// 	},
			// 	include: {
			// 		media: true,
			// 	},
			// });

			// // Create a map of the user's seasons for easy lookup
			// const mySeasonsMap = new Map(mySeasons.map((m) => [m.media.externalId, m]));

			// // Merge the TMDB collection seasons with the user's seasons
			// details.seasons =
			// 	details.seasons
			// 		?.filter((x) => !!x)
			// 		?.sort((a, b) => a.season_number - b.season_number)
			// 		?.map((x) => Object.assign(x, { internal_season: mySeasonsMap.get(x.id) })) ?? [];

			// return {
			// 	details,
			// 	credits,
			// };

			return details;
		}),
});
