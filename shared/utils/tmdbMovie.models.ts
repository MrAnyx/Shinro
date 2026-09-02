import { z } from "zod";

export const TmdbMovieSearchDefaultViewSchema = z.object({
	id: z.string(),
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
	internalId: z.uuid().nullish(),
});

export const TmdbMovieDetailsDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	runtime: z.number(),
	original_title: z.string().nullish(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z
		.array(
			z.object({
				name: z.string().nullish(),
			}),
		)
		.nullish(),
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
				original_name: z.string().nullish(),
				profile_path: z.string().nullish(),
				character: z.string().nullish(),
			}),
		)
		.nullish(),
});

export const TmdbMovieCollectionPartDefaultViewSchema = z.object({
	adult: z.boolean(),
	backdrop_path: z.string().nullish(),
	id: z.string(),
	title: z.string().nullish(),
	original_title: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	media_type: z.string().nullish(),
	original_language: z.string().nullish(),
	popularity: z.number(),
	release_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	internalId: z.uuid().nullish(),
});

export const TmdbMovieCollectionDefaultViewSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	original_language: z.string().nullish(),
	original_name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	backdrop_path: z.string().nullish(),
	parts: z.array(TmdbMovieCollectionPartDefaultViewSchema).nullish(),
});
