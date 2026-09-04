import { z } from "zod";

export type TmdbMovieSearchResponse = z.infer<typeof TmdbMovieSearchResponseSchema>;
