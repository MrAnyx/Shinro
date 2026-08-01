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
});

export const TmdbMovieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	runtime: z.number().nullish(),
	original_title: z.string().nullish(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
});
