import * as z from "zod";

export const TmdbMovieSearchDefaultViewSchema = z.object({
	id: z.number(),
	title: z.string(),
	overview: z.string(),
	original_title: z.string(),
	original_language: z.string(),
	poster_path: z.string().nullable(),
	release_date: z.string(),
	vote_average: z.number(),
	vote_count: z.number(),
	adult: z.boolean(),
});

export const TmdbMovieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z.array(TmdbMovieSearchDefaultViewSchema),
});
