import { z } from "zod";

export const BaseMovieSchema = z.object({
	id: z.uuid(),
	overview: z.string().nullable(),
});

export const MovieSchema = BaseMovieSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});

/**
 * Common output of the internal and external movie details procedures.
 * `movie` is the user's movie (if any), while `details`, `credits` and `saga` are only filled for external movies.
 */
export const MovieDetailsSchema = z.object({
	movie: MovieSchema.nullable(),
	details: z.lazy(() => TmdbMovieDetailsSchema).nullable(),
	credits: z.array(z.lazy(() => TmdbMovieCreditSchema)),
	saga: z.lazy(() => TmdbMovieSagaSchema).nullable(),
	collections: z.array(z.lazy(() => BaseCollectionSchema)),
});
