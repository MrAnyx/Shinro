import { z } from "zod";

export const CollectionMediaDefaultViewSchema = z.object({
	addedAt: z.date(),
	collectionId: z.uuid(),
	mediaId: z.uuid(),
});

export const CollectionMediaWithCollectionViewSchema = CollectionMediaDefaultViewSchema.extend({
	collection: z.lazy(() => CollectionDefaultViewSchema),
});

export const CollectionMediaWithMediaViewSchema = CollectionMediaDefaultViewSchema.extend({
	media: z.lazy(() => MediaDefaultViewSchema),
});
