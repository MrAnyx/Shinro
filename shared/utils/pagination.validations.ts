import * as z from "zod";

export const PaginationValidation = {
	page: z.int("Pagination page must be a valid integer").min(1, "Pagination page must be positive").default(1),
	search: z.string("Pagination search query must be a valid string").trim().optional(),
};
