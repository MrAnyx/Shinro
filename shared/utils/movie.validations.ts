import * as z from "zod";

export const MovieIdSchemaBase = z.uuid("Movie id must be a valid UUID");

export const MovieExternalIdSchemaBase = z
	.string("External movie id must be a valid string")
	.max(255, "External movie id must be less than 255 characters");

export const MovieTitleSchemaBase = z
	.string("Movie title must be a valid string")
	.trim()
	.min(1, "Movie title can not be empty")
	.max(255, "Movie title must be less than 255 characters");

export const MovieDescriptionSchemaBase = z.string("Movie description must be a valid string").trim();

export const MovieRatingSchemaBase = z
	.number()
	.min(0, "Movie rating must be greater or equal to 0")
	.max(10, "Movie rating must be less or equal to 10")
	.multipleOf(0.5, "Movie rating must be a multiple of 0.5");
