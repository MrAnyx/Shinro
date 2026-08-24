import { z } from "zod";

import { MediaType, ImageType, MediaStatus } from "#prisma/enums";
import { MovieDefaultViewSchema, MovieWithMediaViewSchema } from "./movie.models";
import { SerieDefaultViewSchema, SerieWithMediaViewSchema } from "./serie.models";

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

export const MovieMediaViewSchema = MediaDefaultViewSchema.extend({
	type: z.literal(MediaType.MOVIE),
	movie: z.lazy(() => MovieDefaultViewSchema),
});

export const SerieMediaViewSchema = MediaDefaultViewSchema.extend({
	type: z.literal(MediaType.SERIE),
	serie: z.lazy(() => SerieDefaultViewSchema),
});

export const AnyMediaViewSchema = z.discriminatedUnion("type", [
	MovieWithMediaViewSchema,
	SerieWithMediaViewSchema,
	// other types
]);
