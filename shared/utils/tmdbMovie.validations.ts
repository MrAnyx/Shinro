import { z } from "zod";

export const TmdbMovieIdSchemaBase = z
	.string("Tmdb movie id must be a valid string")
	.trim()
	.regex(/^[1-9]\d{0,9}$/, "Tmdb movie id must be a positive integer");
