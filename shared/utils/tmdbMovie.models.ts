import { z } from "zod";

export const TmdbMovieSearchSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	release_date: z.string().nullish(),
	adult: z.boolean(),
	vote_average: z.number(),
	vote_count: z.number(),
	internal_movie: MovieWithMediaSchema.nullish(),
});

export const TmdbMovieDetailsSchema = z.object({
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

export const TmdbMovieCreditSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	profile_path: z.string().nullish(),
	character: z.string().nullish(),
});

export const TmdbMovieSagaSchema = z.object({
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
			internal_movie: MovieWithMediaSchema.nullish(),
		}),
	),
});
