import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerSerieValidation = {
	id: SerieIdSchemaBase,
	overview: SerieOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum(Prisma.SerieScalarFieldEnum),
};
