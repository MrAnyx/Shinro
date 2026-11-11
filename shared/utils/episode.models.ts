import { z } from "zod";

export const EpisodeWithParentsSchema = z.object({
	id: z.uuid(),
	number: z.number().int().nonnegative(),
	overview: z.string().nullable(),
	seasonId: z.uuid(),
	media: z.lazy(() => BaseMediaSchema),
	season: z.lazy(() => SeasonWithSerieSchema),
});

export const EpisodeDetailsSchema = z.object({
	episode: EpisodeWithParentsSchema.nullable(),
	details: z.lazy(() => SeasonEpisodeSchema),
	seasonName: z.string().nullish(),
	serieName: z.string().nullish(),
});
