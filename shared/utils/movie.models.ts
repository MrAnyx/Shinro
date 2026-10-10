import { z } from "zod";

export const BaseMovieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const MovieSchema = BaseMovieSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});
