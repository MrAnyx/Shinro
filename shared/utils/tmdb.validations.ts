import * as z from "zod";

export const TmdbMovieValidation = {
	id: z.string("Tmdb movie id must be a valid string").trim(),
};
