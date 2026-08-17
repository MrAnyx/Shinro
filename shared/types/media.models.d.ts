import { z } from "zod";

export type MediaDefaultView = z.infer<typeof MediaDefaultViewSchema>;
export type MediaWithMediaTypesView = z.infer<typeof MediaWithMediaTypesViewSchema>;
export type MediaWithMovieView = z.infer<typeof MediaWithMovieViewSchema>;
export type MediaWithSerieView = z.infer<typeof MediaWithSerieViewSchema>;
