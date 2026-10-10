import { z } from "zod";

export const BaseSeasonSchema = z.object({
	id: z.uuid(),
	number: z.number(),
	overview: z.string().nullable(),
	serieId: z.uuid(),
});

export const SeasonSchema = BaseSeasonSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});
