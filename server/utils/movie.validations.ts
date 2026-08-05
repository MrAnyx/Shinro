export const ServerMovieValidation = {
	id: MovieIdSchemaBase,
	externalId: MovieExternalIdSchemaBase,
	name: MovieTitleSchemaBase,
	overview: MovieDescriptionSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
	rating: MovieRatingSchemaBase.nullable(),
};
