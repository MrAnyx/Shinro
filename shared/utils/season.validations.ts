import { z } from "zod";

export const SeasonIdSchemaBase = MediaIdSchemaBase;

export const SeasonNumberSchemaBase = z.number().int().nonnegative();

export const SeasonOverviewSchemaBase = z.string("Season overview must be a valid string").trim();
