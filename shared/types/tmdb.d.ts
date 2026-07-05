import * as z from "zod";

export type TMDbMovieSearch = z.infer<typeof TMDbMovieSearchSchema.model>;
export type TMDbMovie = z.infer<typeof TMDbMovieSchema.model>;
export type TMDbMovieDetails = {
	id: number;
	adult: boolean;
	poster_path: string;
	title: string;
	overview: string;
};
