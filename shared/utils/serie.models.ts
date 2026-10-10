import { z } from "zod";

export const BaseSerieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const SerieSchema = BaseSerieSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});
