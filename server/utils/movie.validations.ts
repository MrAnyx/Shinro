import { z } from "zod";

import { Prisma } from "#prisma/client";

type MovieSortField = Prisma.MovieScalarFieldEnum;
type MediaSortField = `media.${Prisma.MediaScalarFieldEnum}`;
type MovieSortFields = MovieSortField | MediaSortField;

export const ServerMovieValidation = {
	id: MovieIdSchemaBase,
	overview: MovieOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum([
		...Object.values(Prisma.MovieScalarFieldEnum),
		...Object.values(Prisma.MediaScalarFieldEnum).map((f): MediaSortField => `media.${f}`),
	] as [MovieSortFields, ...MovieSortFields[]]),
};
