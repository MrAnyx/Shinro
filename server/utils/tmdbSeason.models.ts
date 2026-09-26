import { z } from "zod";

export const TmdbSeasonDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	air_date: z.string().nullish(),
	episodes: z
		.array(
			z
				.object({
					air_date: z.string().nullish(),
					episode_number: z.number(),
					id: z.coerce.string(),
					name: z.string().nullish(),
					overview: z.string().nullish(),
					runtime: z.number(),
					still_path: z.string().nullish(),
					vote_average: z.number(),
					vote_count: z.number(),
					guest_stars: z
						.array(
							z
								.object({
									id: z.coerce.string(),
									character: z.string().nullish(),
									name: z.string().nullish(),
									profile_path: z.string().nullish(),
								})
								.nullish(),
						)
						.nullish(),
				})
				.nullish(),
		)
		.nullish(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	season_number: z.number(),
	vote_average: z.number(),
});
