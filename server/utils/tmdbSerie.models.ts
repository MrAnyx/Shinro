import { z } from "zod";

export const TmdbSerieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z.array(
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
	),
});

export const TmdbSerieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	name: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	original_name: z.string().nullish(),
	overview: z.string().nullish(),
	first_air_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z.array(z.object({ name: z.string().nullish() })).nullish(),
	tagline: z.string().nullish(),
});

export const TmdbSerieCreditsResponseSchema = z.object({
	cast: z
		.array(
			z.object({
				id: z.coerce.string(),
				name: z.string().nullish(),
				profile_path: z.string().nullish(),
				character: z.string().nullish(),
			}),
		)
		.nullish(),
});
