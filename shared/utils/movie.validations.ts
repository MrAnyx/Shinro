import { z } from "zod";

export const MovieIdSchemaBase = MediaIdSchemaBase;

export const MovieOverSchemaBase = z.string("Movie overview must be a valid string").trim();
