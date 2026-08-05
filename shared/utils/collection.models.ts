import * as z from "zod";

export const CollectionDefaultViewSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	description: z.string().nullable(),
	favorite: z.boolean(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
