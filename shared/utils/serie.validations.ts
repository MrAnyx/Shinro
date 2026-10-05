import { z } from "zod";

export const SerieIdSchemaBase = MediaIdSchemaBase;

export const SerieOverSchemaBase = z.string("Serie overview must be a valid string").trim();
