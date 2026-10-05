import { z } from "zod";

export const MovieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const MovieWithMediaSchema = MovieSchema.extend({
	media: z.lazy(() => MediaSchema),
});
