import { z } from "zod";

export const TmdbMovieSearchResponseSchema = z.object({
	total_results: z.number(),
	results: z
		.array(
			z
				.object({
					id: z.coerce.string(),
					title: z.string().nullish(),
					overview: z.string().nullish(),
					poster_path: z.string().nullish(),
					release_date: z.string().nullish(),
					adult: z.boolean(),
					popularity: z.number(),
					vote_average: z.number(),
					vote_count: z.number(),
				})
				.nullish(),
		)
		.nullish(),
});

export const TmdbMovieDetailsResponseSchema = z.object({
	id: z.coerce.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	runtime: z.number(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
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
	belongs_to_collection: z
		.object({
			id: z.coerce.string(),
			name: z.string().nullish(),
		})
		.nullish(),
});

export const TmdbMovieCreditsResponseSchema = z.object({
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

export const TmdbMovieCollectionResponseSchema = z.object({
	name: z.string().nullish(),
	parts: z
		.array(
			z
				.object({
					adult: z.boolean(),
					id: z.coerce.string(),
					title: z.string().nullish(),
					overview: z.string().nullish(),
					poster_path: z.string().nullish(),
					media_type: z.string().nullish(),
					popularity: z.number(),
					release_date: z.string().nullish(),
					vote_average: z.number(),
					vote_count: z.number(),
				})
				.nullish(),
		)
		.nullish(),
});
