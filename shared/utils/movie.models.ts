import * as z from "zod";

export const MovieDefaultViewSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
	mediaId: z.uuid(),
});

export const MovieWithMediaViewSchema = MovieDefaultViewSchema.extend({
	media: z.lazy(() => MediaDefaultViewSchema),
});
