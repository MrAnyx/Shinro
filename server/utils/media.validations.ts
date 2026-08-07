export const ServerMediaValidation = {
	id: MovieIdSchemaBase,
	externalId: MediaExternalIdSchemaBase,
	name: MediaNameSchemaBase,
	rating: MediaRatingSchemaBase.nullable(),

	sort: MediaSortSchemaBase,
};
