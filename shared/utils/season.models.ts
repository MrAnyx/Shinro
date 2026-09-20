import { z } from "zod";

export const SeasonDefaultViewSchema = z.object({
	id: z.uuid(),
	number: z.number(),
	overview: z.string().nullable(),
	serieId: z.uuid(),
});

export const SeasonWithMediaViewSchema = SeasonDefaultViewSchema.extend({
	media: z.lazy(() => MediaDefaultViewSchema),
});
