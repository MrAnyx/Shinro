import { z } from "zod";

import { Prisma } from "#prisma/client";

type SeasonSortField = Prisma.SeasonScalarFieldEnum;
type MediaSortField = `media.${Prisma.MediaScalarFieldEnum}`;
type SeasonSortFields = SeasonSortField | MediaSortField;

export const ServerSeasonValidation = {
	id: SeasonIdSchemaBase,
	number: SeasonNumberSchemaBase,
	overview: SeasonOverviewSchemaBase.nullable().transform((val) => (val === "" ? null : val)),

	sort: z.enum([
		...Object.values(Prisma.SeasonScalarFieldEnum),
		...Object.values(Prisma.MediaScalarFieldEnum).map((f): MediaSortField => `media.${f}`),
	] as [SeasonSortFields, ...SeasonSortFields[]]),
};
