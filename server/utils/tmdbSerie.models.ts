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

const seasonResult = z.object({
	id: z.coerce.string(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	air_date: z.string().nullish(),
	episode_count: z.number().nullish(),
	season_number: z.number().int().nonnegative(),
	vote_average: z.number().nullish(),
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
	seasons: z.array(seasonResult.nullish()).nullish(),
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

export const TmdbSeasonDetailsResponseSchema = z.object({
	episodes: z
		.array(
			z
				.object({
					id: z.coerce.string(),
					episode_number: z.number().int().nonnegative(),
					name: z.string().nullish(),
					overview: z.string().nullish(),
					still_path: z.string().nullish(),
					air_date: z.string().nullish(),
					vote_average: z.number().nullish(),
				})
				.nullish(),
		)
		.nullish(),
});
