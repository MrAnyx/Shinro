import * as z from "zod";

export type TmdbMovieSearchDefaultView = z.infer<typeof TmdbMovieSearchDefaultViewSchema>;
export type TmdbMovieSearchResponse = z.infer<typeof TmdbMovieSearchResponseSchema>;
