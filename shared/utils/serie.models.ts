import { z } from "zod";

export const SerieDefaultViewSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const SerieWithMediaViewSchema = MovieDefaultViewSchema.extend({
	media: z.lazy(() => MediaDefaultViewSchema),
});
