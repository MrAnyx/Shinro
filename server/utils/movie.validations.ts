import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerMovieValidation = {
	id: MovieIdSchemaBase,
	overview: MovieOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum(Prisma.MovieScalarFieldEnum),
};
