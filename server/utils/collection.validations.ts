export const ServerCollectionValidation = {
	id: CollectionIdSchemaBase,
	name: CollectionNameSchemaBase,
	description: CollectionDescriptionSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
	favorite: CollectionFavoriteSchemaBase,

	sort: CollectionSortSchemaBase,
};
