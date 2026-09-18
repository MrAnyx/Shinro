import { z } from "zod";

export const TmdbSerieSearchDefaultViewSchema = z.object({
	id: z.string(),
	adult: z.boolean(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	popularity: z.number(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	internal_serie: SerieWithMediaViewSchema.nullish(),
});

export const TmdbSerieDetailsDefaultViewSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	first_air_date: z.string().nullish(),
	last_air_date: z.string().nullish(),
	in_production: z.boolean(),
	number_of_episodes: z.number(),
	number_of_seasons: z.number(),
	seasons: z
		.array(
			z
				.object({
					air_date: z.string().nullish(),
					episode_count: z.number().nullish(),
					id: z.string(),
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
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z
		.array(
			z
				.object({
					name: z.string().nullish(),
				})
				.nullish(),
		)
		.nullish(),
	tagline: z.string().nullish(),
});

export const TmdbSerieCreditsDefaultViewSchema = z.object({
	cast: z
		.array(
			z
				.object({
					id: z.string(),
					name: z.string().nullish(),
					profile_path: z.string().nullish(),
					character: z.string().nullish(),
				})
				.nullish(),
		)
		.nullish(),
});
