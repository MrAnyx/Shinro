import { z } from "zod";

export const TmdbSerieSearchSchema = z.object({
	id: z.string(),
	adult: z.boolean(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	internal_serie: SerieWithMediaSchema.nullish(),
});

export const TmdbSerieDetailsSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	poster_path: z.string().nullish(),
	adult: z.boolean(),
	first_air_date: z.string().nullish(),
	last_air_date: z.string().nullish(),
	next_episode_to_air: z
		.object({
			air_date: z.string().nullish(),
		})
		.nullish(),
	in_production: z.boolean(),
	number_of_seasons: z.number(),
	number_of_episodes: z.number(),
	overview: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	genres: z.array(z.string()),
	tagline: z.string().nullish(),
});

export const TmdbSerieDetailsSeasonSchema = z.object({
	air_date: z.string().nullish(),
	episode_count: z.number(),
	id: z.string(),
	name: z.string().nullish(),
	season_number: z.number(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	vote_average: z.number(),
	internal_season: SeasonWithMediaSchema.nullish(),
});

export const TmdbSerieCreditSchema = z.object({
	id: z.string(),
	name: z.string().nullish(),
	profile_path: z.string().nullish(),
	character: z.string().nullish(),
});

export const TmdbSerieSeasonDetailsSchema = z.object({
	air_date: z.string().nullish(),
	episode_count: z.number(),
	id: z.string(),
	name: z.string().nullish(),
	season_number: z.number(),
	overview: z.string().nullish(),
	poster_path: z.string().nullish(),
	vote_average: z.number(),
	episodes: z.number(),
});
