import * as z from "zod";

export const MovieBaseSchema = z.object({
	id: z.uuid(),
	externalId: z.string().nullable(),
	title: z.string(),
	description: z.string().nullable(),
	posterPath: z.string().nullable(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const MovieDefaultViewSchema = MovieBaseSchema.pick({
	id: true,
	externalId: true,
	title: true,
	description: true,
	posterPath: true,
	createdAt: true,
	updatedAt: true,
});
