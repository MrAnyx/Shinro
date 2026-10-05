import { z } from "zod";

export const CollectionMediaSchema = z.object({
	addedAt: z.date(),
	collectionId: z.uuid(),
	mediaId: z.uuid(),
});

export const CollectionMediaWithCollectionSchema = CollectionMediaSchema.extend({
	collection: z.lazy(() => CollectionSchema),
});

export const CollectionMediaWithMediaSchema = CollectionMediaSchema.extend({
	media: z.lazy(() => MediaSchema),
});
