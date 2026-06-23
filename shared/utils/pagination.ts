import * as z from "zod";

export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		currentPage: z.number(),
		totalPages: z.number(),
		results: z.array(schema),
	});
