import { z } from "zod";

export const TmdbMovieIdSchemaBase = z.string("Tmdb movie id must be a valid string").trim();
