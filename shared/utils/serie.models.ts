import { z } from "zod";

export const SerieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const SerieWithMediaSchema = SerieSchema.extend({
	media: z.lazy(() => MediaSchema),
});
