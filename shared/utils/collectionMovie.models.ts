import * as z from "zod";

export const CollectionMovieBaseSchema = z.object({
	collectionId: z.uuid(),
	movieId: z.uuid(),
	addedAt: z.date(),
});

export const CollectionMovieDefaultViewSchema = CollectionMovieBaseSchema.pick({
	collectionId: true,
	movieId: true,
	addedAt: true,
});

export const CollectionMovieWithMovieViewSchema = CollectionMovieDefaultViewSchema.extend({
	movie: z.lazy(() => MovieDefaultViewSchema),
});
