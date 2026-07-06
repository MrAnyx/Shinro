import * as z from "zod";

export const UserValidation = {
	username: z
		.string("Username is required")
		.trim()
		.nonempty("Can not be empty")
		.max(255, "Can not exceed 255 characters")
		.refine((x) => /^[a-zA-Z0-9_.-]+$/.test(x), "Some characters are not allowed"),

	password: z
		.string("Password is required")
		.min(16, "Must be at least 16 characters")
		.refine((password) => /[A-Z]/.test(password), "Must contain uppercase characters")
		.refine((password) => /[a-z]/.test(password), "Must contain lowercase characters")
		.refine((password) => /[0-9]/.test(password), "Must contain digits")
		.refine((password) => /[!?@#$%^&*]/.test(password), "Must contain special characters"),
};

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

export const MovieValidation = {
	externalId: z.int("External movie id must be a valid integer"),
};

export const PaginationValidation = {
	page: z.int().positive(),
	search: z.string().trim().optional(),
};
