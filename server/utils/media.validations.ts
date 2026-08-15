import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerMediaValidation = {
	id: MovieIdSchemaBase,
	externalId: MediaExternalIdSchemaBase,
	name: MediaNameSchemaBase,
	rating: MediaRatingSchemaBase.nullable(),
	note: MediaNoteSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum(Prisma.MediaScalarFieldEnum),
};
