import { z } from "zod";

export const TmdbMovieSearchSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	release_date: z.string().nullish(),
	adult: z.boolean().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
	internal_movie: MovieSchema.nullish(),
});

export const TmdbMovieDetailsSchema = z.object({
	id: z.string(),
	title: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean().nullish(),
	runtime: z.number().nullish(),
	overview: z.string().nullish(),
	release_date: z.string().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
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
			adult: z.boolean().nullish(),
			id: z.string(),
			title: z.string().nullish(),
			overview: z.string().nullish(),
			poster_path: z.string().nullish(),
			media_type: z.string().nullish(),
			release_date: z.string().nullish(),
			vote_average: z.number().nullish(),
			vote_count: z.number().nullish(),
			internal_movie: MovieSchema.nullish(),
		}),
	),
});
