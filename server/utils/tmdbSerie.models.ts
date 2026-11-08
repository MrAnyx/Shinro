import { z } from "zod";

const searchResult = z.object({
	id: z.coerce.string(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	adult: z.boolean().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
});

export const TmdbSerieSearchResponseSchema = z.object({
	total_results: z.number().nullish(),
	results: z.array(searchResult.nullish()).nullish(),
});

export const TmdbSerieDetailsResponseSchema = searchResult.extend({
	last_air_date: z.string().nullish(),
	status: z.string().nullish(),
	number_of_seasons: z.number().nullish(),
	number_of_episodes: z.number().nullish(),
	tagline: z.string().nullish(),
	genres: z.array(z.object({ name: z.string().nullish() }).nullish()).nullish(),
});

export const TmdbSerieCreditsResponseSchema = z.object({
	cast: z
		.array(
			z
				.object({
					id: z.coerce.string(),
					name: z.string().nullish(),
					profile_path: z.string().nullish(),
					character: z.string().nullish(),
				})
				.nullish(),
		)
		.nullish(),
});
