import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerMediaValidation = {
	id: MovieIdSchemaBase,
	externalId: MediaExternalIdSchemaBase,
	name: MediaNameSchemaBase,
	rating: MediaRatingSchemaBase.nullable(),

	sort: z.enum(Prisma.MediaScalarFieldEnum),
};
