import { z } from "zod";

export const SeasonSchema = z.object({
	id: z.uuid(),
	number: z.number().int(),
	overview: z.string().nullable(),
	serieId: z.uuid(),
	media: z.lazy(() => BaseMediaSchema),
});

export const SeasonWithSerieSchema = SeasonSchema.extend({
	serie: z.lazy(() => SerieSchema),
});

export const SeasonEpisodeSchema = z.object({
	number: z.number().int().nonnegative(),
	name: z.string().nullish(),
	overview: z.string().nullish(),
	imagePath: z.string().nullish(),
	airDate: z.string().nullish(),
	voteAverage: z.number().nullish(),
});

export const ExternalSeasonDetailsSchema = z.object({
	serie: z.lazy(() => TmdbSerieDetailsSchema),
	season: z.lazy(() => TmdbSerieSeasonSchema),
	episodes: z.array(z.lazy(() => SeasonEpisodeSchema)),
	credits: z.array(z.lazy(() => TmdbSerieCreditSchema)),
	internalSeason: SeasonWithSerieSchema.nullable(),
});
