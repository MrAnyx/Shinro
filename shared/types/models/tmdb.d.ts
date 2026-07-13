import * as z from "zod";

export type TMDbMovieSearch = z.infer<typeof TMDbMovieSearchSchema>;
