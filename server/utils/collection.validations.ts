export const CollectionValidation = {
	id: CollectionIdSchemaBase,
	name: CollectionNameSchemaBase,
	description: CollectionDescriptionSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
};
