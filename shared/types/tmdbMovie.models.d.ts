import { z } from "zod";

export type TmdbMovieSearchDefaultView = z.infer<typeof TmdbMovieSearchDefaultViewSchema>;
export type TmdbMovieDetailsDefaultView = z.infer<typeof TmdbMovieDetailsDefaultViewSchema>;
export type TmdbMovieCreditsDefaultView = z.infer<typeof TmdbMovieCreditsDefaultViewSchema>;
export type TmdbMovieCreditsCastDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbMovieCreditsDefaultViewSchema>["cast"]>[number]
>;
export type TmdbMovieCollectionDefaultView = z.infer<typeof TmdbMovieCollectionDefaultViewSchema>;
export type TmdbMovieCollectionPartDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbMovieCollectionDefaultViewSchema>["parts"]>[number]
>;
