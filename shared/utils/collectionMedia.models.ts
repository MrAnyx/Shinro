import { z } from "zod";

export const BaseCollectionMediaSchema = z.object({
	addedAt: z.date(),
	collectionId: z.uuid(),
	mediaId: z.uuid(),
});

export const CollectionMediaSchema = BaseCollectionMediaSchema.extend({});

export const CollectionMediaWithCollectionSchema = BaseCollectionMediaSchema.extend({
	collection: z.lazy(() => BaseCollectionSchema),
});

export const CollectionMediaWithMediaSchema = BaseCollectionMediaSchema.extend({
	media: z.lazy(() => BaseMediaSchema),
});
