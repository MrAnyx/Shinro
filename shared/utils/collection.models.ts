import { z } from "zod";

export const BaseCollectionSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	favorite: z.boolean(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CollectionSchema = BaseCollectionSchema.extend({});

export const CollectionWithMediasSchema = BaseCollectionSchema.extend({
	medias: z.array(z.lazy(() => CollectionMediaWithMediaSchema)),
});
