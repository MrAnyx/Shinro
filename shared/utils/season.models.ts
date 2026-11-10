import { z } from "zod";

export const SeasonSchema = z.object({
	id: z.uuid(),
	number: z.number().int(),
	overview: z.string().nullable(),
	serieId: z.uuid(),
	media: z.lazy(() => BaseMediaSchema),
});
