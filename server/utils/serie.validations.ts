import { z } from "zod";

import { Prisma } from "#prisma/client";

type SerieSortField = Prisma.SerieScalarFieldEnum;
type MediaSortField = `media.${Prisma.MediaScalarFieldEnum}`;

export const ServerSerieValidation = {
	id: SerieIdSchemaBase,
	overview: SerieOverviewSchemaBase.transform((val) => (val === "" ? null : val)),
	sort: z.enum([
		...Object.values(Prisma.SerieScalarFieldEnum),
		...Object.values(Prisma.MediaScalarFieldEnum).map((field): MediaSortField => `media.${field}`),
	] as [SerieSortField | MediaSortField, ...(SerieSortField | MediaSortField)[]]),
};
