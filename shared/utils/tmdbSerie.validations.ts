import { z } from "zod";

export const TmdbSerieIdSchemaBase = z.string("Tmdb serie id must be a valid string").trim();
