import { z } from "zod";

export type BaseMovie = z.infer<typeof BaseMovieSchema>;
export type Movie = z.infer<typeof MovieSchema>;
