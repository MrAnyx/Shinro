import { z } from "zod";

import { Prisma } from "#prisma/client";

type SerieSortField = Prisma.SerieScalarFieldEnum;
type MediaSortField = `media.${Prisma.MediaScalarFieldEnum}`;
type SerieSortFields = SerieSortField | MediaSortField;

export const ServerSerieValidation = {
	id: SerieIdSchemaBase,
	overview: SerieOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum([
		...Object.values(Prisma.SerieScalarFieldEnum),
		...Object.values(Prisma.MediaScalarFieldEnum).map((f): MediaSortField => `media.${f}`),
	] as [SerieSortFields, ...SerieSortFields[]]),
};
