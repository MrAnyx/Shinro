import { z } from "zod";

import { MediaType, ImageType, MediaStatus } from "#prisma/enums";

export const MediaDefaultViewSchema = z.object({
	id: z.uuid(),
	type: z.enum(MediaType),
	status: z.enum(MediaStatus).nullable(),
	externalId: z.string().nullable(),
	name: z.string().nullable(),
	imagePath: z.string().nullable(),
	imageType: z.enum(ImageType).nullable(),
	rating: z.number().nullable(),
	note: z.string().nullable(),
	ownerId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const MediaWithMediaTypesViewSchema = MediaDefaultViewSchema.extend({
	movie: z.lazy(() => MovieDefaultViewSchema).nullable(),
	serie: z.lazy(() => SerieDefaultViewSchema).nullable(),
});

export const MediaWithMovieViewSchema = MediaDefaultViewSchema.extend({
	movie: z.lazy(() => MovieDefaultViewSchema),
});

export const MediaWithSerieViewSchema = MediaDefaultViewSchema.extend({
	serie: z.lazy(() => SerieDefaultViewSchema),
});
