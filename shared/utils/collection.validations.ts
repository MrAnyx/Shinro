import * as z from "zod";

export const CollectionValidation = {
	id: z.uuid("Collection id must be a valid UUID"),
	name: z
		.string("Collection name must be a valid string")
		.trim()
		.min(1, "Collection name can not be empty")
		.max(255, "Collection name can not exceed 255 characters")
		.refine((x) => /^[a-zA-Z0-9 _.-]+$/.test(x), "Some characters are not allowed"),

	description: z
		.string("Collection description must be a valid string")
		.trim()
		.max(500, "Can not exceed 500 characters")
		.optional()
		.transform((v) => v?.trim() || undefined),
};
