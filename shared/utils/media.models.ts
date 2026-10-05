import { z } from "zod";

import { MediaType, ImageType, MediaStatus } from "#prisma/enums";

export const MediaSchema = z.object({
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

export const MovieMediaSchema = MediaSchema.extend({
	type: z.literal(MediaType.MOVIE),
	movie: z.lazy(() => MovieSchema),
});

export const SerieMediaSchema = MediaSchema.extend({
	type: z.literal(MediaType.SERIE),
	serie: z.lazy(() => SerieSchema),
});

export const SeasonMediaSchema = MediaSchema.extend({
	type: z.literal(MediaType.SEASON),
	serie: z.lazy(() => SeasonSchema),
});

export const AnyMediaSchema = z.discriminatedUnion("type", [
	MovieMediaSchema,
	SerieMediaSchema,
	SeasonMediaSchema,
	// other types
]);
