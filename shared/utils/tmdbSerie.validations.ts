import { z } from "zod";

export const TmdbSerieIdSchemaBase = z.string("TMDB series id must be a valid string").trim().min(1).max(255);
