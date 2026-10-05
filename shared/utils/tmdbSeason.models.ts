import { z } from "zod";

export const TmdbSeasonDetailsSchema = z.object({
	id: z.string(),
	air_date: z.string().nullish(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	season_number: z.number(),
	vote_average: z.number(),
});

export const TmdbSeasonDetailsEpisodeSchema = z.object({
	air_date: z.string().nullish(),
	episode_number: z.number(),
	id: z.string(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	runtime: z.number(),
	still_path: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
});
