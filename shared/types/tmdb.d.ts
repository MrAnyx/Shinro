import * as z from "zod";

export type TMDbMovieSearch = z.infer<typeof TMDbMovieSearchSchema.model>;
export type TMDbMovie = z.infer<typeof TMDbMovieSchema.model>;
