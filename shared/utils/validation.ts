import * as z from "zod";

export const UserSchema = createSchemaGroup({
	model: z.object({
		id: z.uuid(),
		username: z.string(),
		role: z.enum(["ADMIN", "USER"]),
		createdAt: z.date(),
		updatedAt: z.date(),
	}),
	validation: {
		username: z
			.string("Username is required")
			.max(255, "Can not exceed 255 characters")
			.trim()
			.nonempty("Can not be empty")
			.refine((x) => /^[a-zA-Z0-9_.-]+$/.test(x), "Some characters are not allowed"),

		password: z
			.string("Password is required")
			.min(16, "Must be at least 16 characters")
			.refine((password) => /[A-Z]/.test(password), "Must contain uppercase characters")
			.refine((password) => /[a-z]/.test(password), "Must contain lowercase characters")
			.refine((password) => /[0-9]/.test(password), "Must contain digits")
			.refine((password) => /[!?@#$%^&*]/.test(password), "Must contain special characters"),
	},
});

export const CollectionSchema = createSchemaGroup({
	model: z.object({
		id: z.uuid(),
		name: z.string(),
		description: z.string().nullable(),
		owner: UserSchema.model,
		createdAt: z.date(),
		updatedAt: z.date(),
	}),
	validation: {
		name: z
			.string("Name is required")
			.nonempty("Can not be empty")
			.trim()
			.max(255, "Can not exceed 255 characters")
			.refine((x) => /^[a-zA-Z0-9 _.-]+$/.test(x), "Some characters are not allowed"),

		description: z
			.string()
			.max(500, "Can not exceed 500 characters")
			.trim()
			.optional()
			.transform((v) => v?.trim() || undefined),
	},
});

export const PaginationSchema = createSchemaGroup({
	model: z.object(),
	validation: {
		page: z.number().int().min(1),
		search: z.string().trim().optional(),
	},
});

export const TMDbMovieSchema = createSchemaGroup({
	model: z.object({
		id: z.number(),
		title: z.string(),
		overview: z.string(),
		original_title: z.string(),
		original_language: z.string(),
		poster_path: z.string().nullable(),
		release_date: z.string(),
		vote_average: z.number(),
		vote_count: z.number(),
		adult: z.boolean(),
	}),
	validation: {},
});

export const TMDbMovieSearchSchema = createSchemaGroup({
	model: z.object({
		page: z.number(),
		total_pages: z.number(),
		total_results: z.number(),
		results: z.array(TMDbMovieSchema.model),
	}),
	validation: {},
});
