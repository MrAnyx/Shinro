export const ServerMovieValidation = {
	id: MovieIdSchemaBase,
	externalId: MovieExternalIdSchemaBase,
	title: MovieTitleSchemaBase,
	description: MovieDescriptionSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
};
