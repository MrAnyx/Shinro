import { z } from "zod";

export const CollectionSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	favorite: z.boolean(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CollectionWithMediasSchema = CollectionSchema.extend({
	medias: z.array(z.lazy(() => CollectionMediaWithMediaSchema)),
});
