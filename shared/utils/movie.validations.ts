import * as z from "zod";

export const MovieValidation = {
	id: z.uuid("Movie id must be a valid UUID"),
	externalId: z.int("External movie id must be a valid integer"),
};
