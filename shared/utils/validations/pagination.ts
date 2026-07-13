import * as z from "zod";

export const PaginationValidation = {
	page: z.int().positive(),
	search: z.string().trim().optional(),
};
