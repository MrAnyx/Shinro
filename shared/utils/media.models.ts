import { z } from "zod";

import { MediaType, ImageType, MediaStatus, SourceType } from "#prisma/enums";

export const BaseMediaSchema = z.object({
	id: z.uuid(),
	type: z.enum(MediaType),
	status: z.enum(MediaStatus).nullable(),
	source: z.enum(SourceType),
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

export const MediaSchema = BaseMediaSchema.extend({});

export const MovieMediaSchema = BaseMediaSchema.extend({
	type: z.literal(MediaType.MOVIE),
	movie: z.lazy(() => BaseMovieSchema),
});

export const AnyMediaSchema = z.discriminatedUnion("type", [
	MovieMediaSchema,
	// other types
]);
