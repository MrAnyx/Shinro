import * as z from "zod";

export const CollectionMediaDefaultViewSchema = z.object({
	collectionId: z.uuid(),
	mediaId: z.uuid(),
	addedAt: z.date(),
});

export const CollectionMediaWithMediaViewSchema = CollectionMediaDefaultViewSchema.extend({
	media: z.lazy(() => MediaWithMediaTypesViewSchema),
});
