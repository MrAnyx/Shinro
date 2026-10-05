import { z } from "zod";

export type TmdbMovieSearch = z.infer<typeof TmdbMovieSearchSchema>;
export type TmdbMovieDetails = z.infer<typeof TmdbMovieDetailsSchema>;
export type TmdbMovieCredit = z.infer<typeof TmdbMovieCreditSchema>;
export type TmdbMovieSaga = z.infer<typeof TmdbMovieSagaSchema>;
export type TmdbMovieSagaMovie = NonNullable<NonNullable<z.infer<typeof TmdbMovieSagaSchema>["movies"]>[number]>;
