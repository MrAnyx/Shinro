import { z } from "zod";

export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
	z.object({
		total: z.number(),
		results: z.array(schema),
	});

export const SortableSchema = <T extends z.ZodEnum>(fields: T) =>
	z
		.array(
			z.object({
				sort: fields,
				order: ServerPaginationValidation.order,
			}),
		)
		.default([]);
