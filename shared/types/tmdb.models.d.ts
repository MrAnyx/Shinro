import * as z from "zod";

export type TmdbMovieSearchDefaultView = z.infer<typeof TmdbMovieSearchDefaultViewSchema>;
export type TmdbMovieDetailsDefaultView = z.infer<typeof TmdbMovieDetailsDefaultViewSchema>;
export type TmdbMovieCreditsDefaultView = z.infer<typeof TmdbMovieCreditsDefaultViewSchema>;
