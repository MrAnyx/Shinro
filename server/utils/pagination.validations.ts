import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerPaginationValidation = {
	page: PaginationPageSchemaBase,
	search: PaginationSearchSchemaBase.nullish().transform((val) => (val === "" ? null : val)),
	force: PaginationForceSchemaBase,

	order: z.enum(Prisma.SortOrder),
};
