import { z } from "zod";

export type BaseMovie = z.infer<typeof BaseMovieSchema>;
export type Movie = z.infer<typeof MovieSchema>;
export type MovieWithCollections = z.infer<typeof MovieWithCollectionsSchema>;
export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
