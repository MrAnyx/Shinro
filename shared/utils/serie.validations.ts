import { z } from "zod";

export const SerieIdSchemaBase = MediaIdSchemaBase;
export const SerieOverviewSchemaBase = z.string("Series overview must be a valid string").trim();
