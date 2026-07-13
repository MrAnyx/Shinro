import * as z from "zod";

export const CollectionValidation = {
	id: z.uuid("Collection id must be a valid UUID"),
	name: z
		.string("Name is required")
		.trim()
		.nonempty("Can not be empty")
		.max(255, "Can not exceed 255 characters")
		.refine((x) => /^[a-zA-Z0-9 _.-]+$/.test(x), "Some characters are not allowed"),

	description: z
		.string()
		.trim()
		.max(500, "Can not exceed 500 characters")
		.optional()
		.transform((v) => v?.trim() || undefined),
};
