import { z } from "zod";

export type TmdbSerieSearchDefaultView = z.infer<typeof TmdbSerieSearchDefaultViewSchema>;
export type TmdbSerieSeasonDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbSerieDetailsDefaultViewSchema>["seasons"]>[number]
>;
// export type TmdbMovieDetailsDefaultView = z.infer<typeof TmdbMovieDetailsDefaultViewSchema>;
// export type TmdbMovieCreditsDefaultView = z.infer<typeof TmdbMovieCreditsDefaultViewSchema>;
// export type TmdbMovieCollectionPartDefaultView = z.infer<typeof TmdbMovieCollectionPartDefaultViewSchema>;
// export type TmdbMovieCollectionDefaultView = z.infer<typeof TmdbMovieCollectionDefaultViewSchema>;
