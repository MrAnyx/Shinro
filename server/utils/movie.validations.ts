export const ServerMovieValidation = {
	id: MovieIdSchemaBase,
	overview: MovieOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
};
