import * as z from "zod";

export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		total: z.number(),
		results: z.array(schema),
	});
