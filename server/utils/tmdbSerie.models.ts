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
					popularity: z.number(),
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
	adult: z.boolean(),
	first_air_date: z.string().nullish(),
	genres: z
		.array(
			z
				.object({
					name: z.string().nullish(),
				})
				.nullish(),
		)
		.nullish(),
	id: z.coerce.string(),
	in_production: z.boolean(),
	last_air_date: z.string().nullish(),
	name: z.string().nullish(),
	number_of_episodes: z.number(),
	number_of_seasons: z.number(),
	seasons: z
		.array(
			z
				.object({
					air_date: z.string().nullish(),
					episode_count: z.number().nullish(),
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
	overview: z.string().nullish(),
	popularity: z.number(),
	poster_path: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	tagline: z.string().nullish(),
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
