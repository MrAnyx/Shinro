export const ServerPaginationValidation = {
	page: PaginationPageSchemaBase,
	search: PaginationSearchSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
};
