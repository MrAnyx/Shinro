import { z } from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	search: protectedProcedure
		.input(z.void())
		// .output(z.void())
		.query(async () => {
			const musics = useCache(`spotify:search`, async () => {
				return await spotify("/search", {
					query: {
						type: "album",
						market: "FR",
						q: "ATTITUDE",
						limit: SPOTIFY_ITEMS_PER_PAGE,
					},
					schema: z.any(),
				});
			});

			return musics;
		}),
});
