import * as z from "zod";

import { Prisma } from "#prisma/client";

export const MovieSortSchemaBase = z.enum(Prisma.MovieScalarFieldEnum);

export const MovieIdSchemaBase = MediaIdSchemaBase;

export const MovieOverviewSchemaBase = z.string("Movie overview must be a valid string").trim();
