import * as z from "zod";

import { MediaType } from "#prisma/enums";

export const MediaDefaultViewSchema = z.object({
	id: z.uuid(),
	type: z.enum(MediaType),
	externalId: z.string().nullable(),
	name: z.string().nullable(),
	imagePath: z.string().nullable(),
	rating: z.number().nullable(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const MediaWithMediaTypesViewSchema = MediaDefaultViewSchema.extend({
	movie: z.lazy(() => MovieDefaultViewSchema).nullable(),
});

export const MediaWithMovieViewSchema = MediaDefaultViewSchema.extend({
	movie: z.lazy(() => MovieDefaultViewSchema),
});
