import { z } from "zod";

export const TmdbSerieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z
		.array(
			z
				.object({
					id: z.coerce.string(),
					adult: z.boolean(),
					name: z.string().nullish(),
					overview: z.string().nullish(),
					poster_path: z.string().nullish(),
					first_air_date: z.string().nullish(),
					vote_average: z.number(),
					vote_count: z.number(),
				})
				.nullish(),
		)
		.nullish(),
});

export const TmdbSerieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	name: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	first_air_date: z.string().nullish(),
	last_air_date: z.string().nullish(),
	in_production: z.boolean(),
	number_of_seasons: z.number(),
	number_of_episodes: z.number(),
	overview: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	tagline: z.string().nullish(),
	genres: z
		.array(
			z
				.object({
					name: z.string().nullish(),
				})
				.nullish(),
		)
		.nullish(),
	seasons: z
		.array(
			z
				.object({
					air_date: z.string().nullish(),
					episode_count: z.number(),
					id: z.coerce.string(),
					name: z.string().nullish(),
					season_number: z.number(),
					overview: z.string().nullish(),
					poster_path: z.string().nullish(),
					vote_average: z.number(),
				})
				.nullish(),
		)
		.nullish(),
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

export const TmdbSerieSeasonDetailsResponseSchema = z.object({
	air_date: z.string().nullish(),
	episode_count: z.number(),
	id: z.coerce.string(),
	name: z.string().nullish(),
	season_number: z.number(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	vote_average: z.number(),
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
				})
				.nullish(),
		)
		.nullish(),
});
