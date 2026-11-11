import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerMediaValidation = {
	id: MediaIdSchemaBase,
	externalId: MediaExternalIdSchemaBase,
	status: MediaStatusSchemaBase,
	type: MediaTypeSchemaBase,
	source: MediaSourceTypeSchemaBase,
	name: MediaNameSchemaBase,
	rating: MediaRatingSchemaBase,
	note: MediaNoteSchemaBase.transform((val) => (val === "" ? null : val)),

	sort: z.enum(Prisma.MediaScalarFieldEnum),
};
