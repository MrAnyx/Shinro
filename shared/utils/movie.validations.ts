import * as z from "zod";

export const MovieIdSchemaBase = MediaIdSchemaBase;

export const MovieOverviewSchemaBase = z.string("Movie overview must be a valid string").trim();
