import * as z from "zod";

// Movies
export type TmdbMoviesInput = z.infer<typeof TmdbMoviesInputSchema>;
export type TmdbMoviesOutput = z.infer<typeof TmdbMoviesOutputSchema>;
