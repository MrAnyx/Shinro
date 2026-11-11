import { z } from "zod";

export const CollectionIdSchemaBase = z.uuid("Collection id must be a valid UUID");
export const CollectionIdsSchemaBase = z.array(CollectionIdSchemaBase);
export const COLLECTION_NAME_MAX_LENGTH = 255;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 500;

export const CollectionNameSchemaBase = z
	.string("Collection name must be a valid string")
	.trim()
	.min(1, "Collection name can not be empty")
	.max(COLLECTION_NAME_MAX_LENGTH, "Collection name can not exceed 255 characters");

export const CollectionDescriptionSchemaBase = z
	.string("Collection description must be a valid string")
	.trim()
	.max(COLLECTION_DESCRIPTION_MAX_LENGTH, "Collection description can not exceed 500 characters");

export const CollectionFavoriteSchemaBase = z.boolean("Collection favorite must be a valid boolean");
