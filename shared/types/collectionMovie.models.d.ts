import * as z from "zod";

export type CollectionMovieBase = z.infer<typeof CollectionMovieBaseSchema>;
export type CollectionMovieDefaultView = z.infer<typeof CollectionMovieDefaultViewSchema>;
export type CollectionMovieWithMovieView = z.infer<typeof CollectionMovieWithMovieViewSchema>;
