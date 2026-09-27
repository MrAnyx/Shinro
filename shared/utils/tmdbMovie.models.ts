import { z } from "zod";

export const TmdbMovieSearchDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	release_date: z.string().nullish(),
	adult: z.boolean(),
	vote_average: z.number(),
	vote_count: z.number(),
	internal_movie: MovieWithMediaViewSchema.nullish(),
});

export const TmdbMovieDetailsDefaultViewSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	runtime: z.number(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z.array(z.string()),
	tagline: z.string().nullish(),
});

export const TmdbMovieCreditsDefaultViewSchema = z.array(
	z.object({
		id: z.string(),
		name: z.string().nullish(),
		profile_path: z.string().nullish(),
		character: z.string().nullish(),
	}),
);

export const TmdbMovieSagaDefaultViewSchema = z.object({
	name: z.string().nullish(),
	movies: z.array(
		z.object({
			adult: z.boolean(),
			id: z.string(),
			title: z.string().nullish(),
			overview: z.string().nullish(),
			poster_path: z.string().nullish(),
			media_type: z.string().nullish(),
			release_date: z.string().nullish(),
			vote_average: z.number(),
			vote_count: z.number(),
			internal_movie: MovieWithMediaViewSchema.nullish(),
		}),
	),
});
