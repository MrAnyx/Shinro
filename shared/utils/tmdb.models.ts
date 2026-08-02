import * as z from "zod";

export const TmdbMovieSearchDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	overview: z.string().nullish(),
	original_title: z.string().nullish(),
	original_language: z.string().nullish(),
	poster_path: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	adult: z.boolean(),
	internalId: z.uuid().nullish(),
});

export const TmdbMovieDetailsDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	runtime: z.number().nullish(),
	poster_path: z.string().nullish(),
	original_title: z.string().nullish(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
	genres: z.array(z.object({ name: z.string().nullish() })).nullish(),
	tagline: z.string().nullish(),
	belongs_to_collection: z
		.object({
			name: z.string().nullish(),
		})
		.nullish(),
});

export const TmdbMovieCreditsDefaultViewSchema = z.object({
	cast: z
		.array(
			z.object({
				id: z.string(),
				name: z.string().nullish(),
				profile_path: z.string().nullish(),
				character: z.string().nullish(),
			}),
		)
		.nullish(),
});
