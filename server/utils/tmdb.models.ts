import * as z from "zod";

export const TmdbMovieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z.array(
		z.object({
			id: z.coerce.string(),
			title: z.string().nullish(),
			overview: z.string().nullish(),
			poster_path: z.string().nullish(),
			release_date: z.string().nullish(),
			original_title: z.string().nullish(),
			original_language: z.string().nullish(),
			adult: z.boolean(),
			popularity: z.number(),
			vote_average: z.number(),
			vote_count: z.number(),
		}),
	),
});

export const TmdbMovieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	runtime: z.number(),
	original_title: z.string().nullish(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z.array(z.object({ name: z.string().nullish() })).nullish(),
	tagline: z.string().nullish(),
	belongs_to_collection: z
		.object({
			name: z.string().nullish(),
		})
		.nullish(),
});

export const TmdbMovieCreditsResponseSchema = z.object({
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
