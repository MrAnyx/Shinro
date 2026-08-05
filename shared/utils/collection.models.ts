import * as z from "zod";

export const CollectionBaseSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	favorite: z.boolean(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CollectionDefaultViewSchema = CollectionBaseSchema.pick({
	id: true,
	name: true,
	description: true,
	favorite: true,
	createdAt: true,
	updatedAt: true,
});
