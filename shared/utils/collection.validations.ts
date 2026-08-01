import * as z from "zod";

export const CollectionIdSchemaBase = z.uuid("Collection id must be a valid UUID");

export const CollectionNameSchemaBase = z
	.string("Collection name must be a valid string")
	.trim()
	.min(1, "Collection name can not be empty")
	.max(255, "Collection name can not exceed 255 characters");

export const CollectionDescriptionSchemaBase = z
	.string("Collection description must be a valid string")
	.trim()
	.max(500, "Collection description can not exceed 500 characters");
