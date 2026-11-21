import { z } from "zod";

export const PaginationPageSchemaBase = z
	.int("Pagination page must be a valid integer")
	.min(1, "Pagination page must be positive")
	.default(1);

export const PAGINATION_SEARCH_MAX_LENGTH = 100;

export const PaginationSearchSchemaBase = z
	.string("Pagination search query must be a valid string")
	.trim()
	.max(
		PAGINATION_SEARCH_MAX_LENGTH,
		`Pagination search query must be less than ${PAGINATION_SEARCH_MAX_LENGTH} characters`,
	);

export const PaginationForceSchemaBase = z.boolean("Pagination force must be a valid boolean").default(false);
