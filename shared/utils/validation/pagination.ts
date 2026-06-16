import * as z from "zod";

export const PaginationSchema = z.object({
	page: z.number(),
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		currentPage: z.number(),
		totalPages: z.number(),
		results: z.array(schema),
	});
