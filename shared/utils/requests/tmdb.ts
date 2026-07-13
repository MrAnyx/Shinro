import * as z from "zod";

import { MovieBaseSchema } from "#shared/utils/models/movie";

// Movies
export const TmdbMoviesInputSchema = z.object({
	search: z.string().min(1),
	page: z.number().default(1),
});
export const TmdbMoviesOutputSchema = MovieBaseSchema.pick({
	id: true,
	description: true,
	externalId: true,
	posterPath: true,
	title: true,
	createdAt: true,
	updatedAt: true,
});
