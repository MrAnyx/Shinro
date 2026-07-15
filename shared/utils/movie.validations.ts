import * as z from "zod";

export const MovieValidation = {
	id: z.uuid("Movie id must be a valid UUID"),
	externalId: z
		.string("External movie id must be a valid string")
		.max(255, "External movie id must be less than 255 characters"),
	title: z
		.string("Movie title must be a valid string")
		.trim()
		.min(1, "Movie title can not be empty")
		.max(255, "Movie title must be less than 255 characters"),
	description: z.string("Movie description must be a valid string").trim().optional(),
};
