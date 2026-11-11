import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerCollectionValidation = {
	id: CollectionIdSchemaBase,
	ids: CollectionIdsSchemaBase,
	name: CollectionNameSchemaBase,
	description: CollectionDescriptionSchemaBase.nullable().transform((val) => (val === "" ? null : val)),
	favorite: CollectionFavoriteSchemaBase,

	sort: z.enum(Prisma.CollectionScalarFieldEnum),
};
