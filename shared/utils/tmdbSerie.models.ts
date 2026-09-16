import { z } from "zod";

export const TmdbSerieSearchDefaultViewSchema = z.object({
	id: z.string(),
	adult: z.boolean(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	popularity: z.number(),
	poster_path: z.string().nullish(),
	first_air_date: z.string().nullish(),
	vote_average: z.number(),
	vote_count: z.number(),
	internal_serie: SerieWithMediaViewSchema.nullish(),
});
