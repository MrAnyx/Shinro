export const ClientMediaValidation = {
	id: MediaIdSchemaBase,
	externalId: MediaExternalIdSchemaBase,
	name: MediaNameSchemaBase,
	rating: MediaRatingSchemaBase.optional(),
	note: MediaNoteSchemaBase,
	status: MediaStatusSchemaBase.optional(),
};
