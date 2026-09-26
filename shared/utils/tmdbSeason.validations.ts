import { z } from "zod";

export const TmdbSeasonNumberSchemaBase = z.string("Tmdb season number must be a valid integer").trim();
