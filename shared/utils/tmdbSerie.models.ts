import { z } from "zod";

export const TmdbSerieSearchSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	adult: z.boolean().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
	internal_serie: z.lazy(() => SerieSchema).nullish(),
});

export const TmdbSerieDetailsSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	adult: z.boolean().nullish(),
	vote_average: z.number().nullish(),
	vote_count: z.number().nullish(),
	last_air_date: z.string().nullish(),
	status: z.string().nullish(),
	number_of_seasons: z.number().nullish(),
	number_of_episodes: z.number().nullish(),
	genres: z.array(z.string()),
	tagline: z.string().nullish(),
});

export const TmdbSerieCreditSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	profile_path: z.string().nullish(),
	character: z.string().nullish(),
});
