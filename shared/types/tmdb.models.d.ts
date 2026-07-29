import * as z from "zod";

export type TmdbMovieSearchDefaultView = z.infer<typeof TmdbMovieSearchDefaultViewSchema>;
export type TmdbMovieSearchResponse = z.infer<typeof TmdbMovieSearchResponseSchema>;
export type TmdbMovieDetailsDefaultView = z.infer<typeof TmdbMovieDetailsDefaultViewSchema>;
export type TmdbMovieDetailsResponse = z.infer<typeof TmdbMovieDetailsResponseSchema>;
