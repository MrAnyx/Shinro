import { z } from "zod";

export const BaseSerieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const SerieSchema = BaseSerieSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});

export const SerieDetailsSchema = z.object({
	serie: SerieSchema.nullable(),
	details: z.lazy(() => TmdbSerieDetailsSchema).nullable(),
	credits: z.array(z.lazy(() => TmdbSerieCreditSchema)),
	collections: z.array(z.lazy(() => BaseCollectionSchema)),
});
