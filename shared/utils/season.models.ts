import { z } from "zod";

export const SeasonSchema = z.object({
	id: z.uuid(),
	number: z.number(),
	overview: z.string().nullable(),
	serieId: z.uuid(),
});

export const SeasonWithMediaSchema = SeasonSchema.extend({
	media: z.lazy(() => MediaSchema),
});
