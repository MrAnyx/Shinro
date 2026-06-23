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
		owner: UserSchema.model,
		createdAt: z.date(),
		updatedAt: z.date(),
	}),
	validation: {
		name: z
			.string("Name is required")
			.nonempty("Can not be empty")
			.max(255, "Can not exceed 255 characters")
			.refine((x) => /^[a-zA-Z0-9 _.-]+$/.test(x), "Some characters are not allowed"),
	},
});

export const PaginationSchema = createSchemaGroup({
	model: z.object({
		page: z.number(),
	}),
	validation: {},
});

export const TMDbMovieSearchSchema = z.object({
	page: z.number(),
	total_pages: z.number(),
	total_results: z.number(),
	results: z.array(
		z.object({
			id: z.number(),
			title: z.string(),
			original_title: z.string(),
			original_language: z.string(),
			poster_path: z.string().nullable(),
			release_date: z.string(),
			vote_average: z.number(),
			vote_count: z.number(),
			adult: z.boolean(),
		}),
	),
});
