import { z } from "zod";
import { MediaStatus } from "~~/lib/prisma/enums";

export const MediaIdSchemaBase = z.uuid("Media id must be a valid UUID");

export const MediaExternalIdSchemaBase = z
	.string("External media id must be a valid string")
	.max(255, "External media id must be less than 255 characters");

export const MediaNameSchemaBase = z
	.string("Media title must be a valid string")
	.trim()
	.min(1, "Media title can not be empty")
	.max(255, "Media title must be less than 255 characters");

export const MediaStatusSchemaBase = z.enum(MediaStatus);

export const MediaRatingSchemaBase = z
	.number()
	.min(0, "Media rating must be greater or equal to 0")
	.max(10, "Media rating must be less or equal to 10")
	.multipleOf(0.5, "Media rating must be a multiple of 0.5");

export const MediaNoteSchemaBase = z.string().trim().max(1000, "Media note must be less or equal to 1000");
