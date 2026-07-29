import * as z from "zod";

export const TmdbMovieSearchDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string(),
	overview: z.string().nullable(),
	original_title: z.string(),
	original_language: z.string(),
	poster_path: z.string().nullable(),
	release_date: z.string(),
	vote_average: z.number(),
	vote_count: z.number(),
	adult: z.boolean(),
	internalId: z.uuid().nullable(),
});

export const TmdbMovieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z.array(
		z.object({
			id: z.coerce.string(),
			title: z.string(),
			overview: z.string(),
			original_title: z.string(),
			original_language: z.string(),
			poster_path: z.string().nullable(),
			release_date: z.string(),
			vote_average: z.number(),
			vote_count: z.number(),
			adult: z.boolean(),
		}),
	),
});

export const TmdbMovieDetailsDefaultViewSchema = z.object({
	id: z.string(),
	poster_path: z.string().nullable(),
	backdrop_path: z.string().nullable(),
	genres: z.array(
		z.object({
			name: z.string(),
		}),
	),
	original_title: z.string(),
	overview: z.string().nullable(),
	release_date: z.string(),
	title: z.string(),
	vote_average: z.number(),
	vote_count: z.number(),
});

export const TmdbMovieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	poster_path: z.string().nullable(),
	backdrop_path: z.string().nullable(),
	genres: z.array(
		z.object({
			name: z.string(),
		}),
	),
	runtime: z.number().nullable(),
	original_title: z.string(),
	overview: z.string().nullable(),
	release_date: z.string(),
	title: z.string(),
	vote_average: z.number(),
	vote_count: z.number(),
});
