import { z } from "zod";
import { MediaStatus, SourceType } from "~~/lib/prisma/enums";

export const MEDIA_EXTERNAL_ID_MAX_LENGTH = 255;
export const MEDIA_NAME_MAX_LENGTH = 255;
export const MEDIA_NOTE_MAX_LENGTH = 1000;

export const MediaIdSchemaBase = z.uuid("Media id must be a valid UUID");

export const MediaExternalIdSchemaBase = z
	.string("External media id must be a valid string")
	.max(
		MEDIA_EXTERNAL_ID_MAX_LENGTH,
		`External media id must be less than ${MEDIA_EXTERNAL_ID_MAX_LENGTH} characters`,
	);

export const MediaNameSchemaBase = z
	.string("Media title must be a valid string")
	.trim()
	.min(1, "Media title can not be empty")
	.max(MEDIA_NAME_MAX_LENGTH, `Media title must be less than ${MEDIA_NAME_MAX_LENGTH} characters`);

export const MediaStatusSchemaBase = z.enum(MediaStatus, "Media status must be a valid enum value");

export const MediaSourceTypeSchemaBase = z.enum(SourceType, "Media source type must be a valid enum value");

export const MediaRatingSchemaBase = z
	.number()
	.min(0, "Media rating must be greater or equal to 0")
	.max(10, "Media rating must be less or equal to 10")
	.multipleOf(0.5, "Media rating must be a multiple of 0.5");

export const MediaNoteSchemaBase = z
	.string()
	.trim()
	.max(MEDIA_NOTE_MAX_LENGTH, `Media note must be less or equal to ${MEDIA_NOTE_MAX_LENGTH}`);
