import * as z from "zod";

export const MovieValidation = {
	id: z.uuid("Movie id must be a valid UUID"),
	externalId: z.int("External movie id must be a valid integer"),
	title: z
		.string("Movie title must be a valid string")
		.min(1, "Movie title can not be empty")
		.max(255, "Movie title must be less than 255 characters"),
	description: z
		.string("Movie description must be a valid string")
		.optional()
		.transform((v) => v?.trim() || undefined),
};
