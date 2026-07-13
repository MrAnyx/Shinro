import * as z from "zod";

export const MovieValidation = {
	externalId: z.int("External movie id must be a valid integer"),
};
