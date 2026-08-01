export const PaginationValidation = {
	page: PaginationPageSchemaBase,
	search: PaginationSearchSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
};
