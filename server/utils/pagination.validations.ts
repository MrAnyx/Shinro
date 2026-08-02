export const ServerPaginationValidation = {
	page: PaginationPageSchemaBase,
	search: PaginationSearchSchemaBase.nullish().transform((val) => (val === "" ? null : val)),
	force: PaginationForceSchemaBase,
};
