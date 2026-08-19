import { z } from "zod";

export const TmdbSerieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z
		.array(
			z.object({
				id: z.coerce.string(),
				name: z.string().nullish(),
				overview: z.string().nullish(),
				poster_path: z.string().nullish(),
				first_air_date: z.string().nullish(),
				original_name: z.string().nullish(),
				original_language: z.string().nullish(),
				adult: z.boolean(),
				popularity: z.number(),
				vote_average: z.number(),
				vote_count: z.number(),
			}),
		)
		.nullish(),
});

export const TmdbSerieDetailsResponseSchema = z.object({
	adult: z.boolean(),
	first_air_date: z.string().nullish(),
	genres: z
		.array(
			z.object({
				name: z.string().nullish(),
			}),
		)
		.nullish(),
	id: z.coerce.string(),
	in_production: z.boolean(),
	last_air_date: z.string().nullish(),
	last_episode_to_air: z
		.object({
			air_date: z.string().nullish(),
		})
		.nullish(),
	next_episode_to_air: z
		.object({
			air_date: z.string().nullish(),
		})
		.nullish(),
	name: z.string().nullish(),
	number_of_episodes: z.number(),
	number_of_seasons: z.number(),
	original_language: z.string().nullish(),
	original_name: z.string().nullish(),
	overview: z.string().nullish(),
	popularity: z.number(),
	poster_path: z.string().nullish(),
	seasons: z
		.array(
			z.object({
				air_date: z.string().nullish(),
				episode_count: z.number(),
				id: z.coerce.string(),
				name: z.string().nullish(),
				overview: z.string().nullish(),
				poster_path: z.string().nullish(),
				season_number: z.number(),
				vote_average: z.number(),
			}),
		)
		.nullish(),
	status: z.string().nullish(),
	tagline: z.string().nullish(),
	type: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
});

export const TmdbSerieCreditsResponseSchema = z.object({
	cast: z
		.array(
			z.object({
				id: z.coerce.string(),
				name: z.string().nullish(),
				original_name: z.string().nullish(),
				profile_path: z.string().nullish(),
				character: z.string().nullish(),
			}),
		)
		.nullish(),
});
