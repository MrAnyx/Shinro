import { z } from "zod";

export const TmdbSeasonNumberSchemaBase = z
	.int("Tmdb season number must be a valid integer")
	.gte(0, "Tmdb season number must be greater or equal to 0");
