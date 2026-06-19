import * as z from "zod";

// Entity
export const UserSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	role: z.enum(["ADMIN", "USER"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CollectionSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	owner: UserSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Input
export const UsernameSchema = z
	.string("Username is required")
	.max(255, "Can not exceed 255 characters")
	.nonempty("Can not be empty")
	.refine((x) => /^[a-zA-Z0-9_.-]+$/.test(x), "Some characters are not allowed");

export const PasswordSchema = z
	.string("Password is required")
	.min(16, "Must be at least 16 characters")
	.refine((password) => /[A-Z]/.test(password), "Must contain uppercase characters")
	.refine((password) => /[a-z]/.test(password), "Must contain lowercase characters")
	.refine((password) => /[0-9]/.test(password), "Must contain digits")
	.refine((password) => /[!?@#$%^&*]/.test(password), "Must contain special characters");

// Pagination
export const PaginationSchema = z.object({
	page: z.number(),
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		currentPage: z.number(),
		totalPages: z.number(),
		results: z.array(schema),
	});

// TMDb
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
