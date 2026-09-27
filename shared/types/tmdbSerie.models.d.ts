import { z } from "zod";

export type TmdbSerieSearchDefaultView = z.infer<typeof TmdbSerieSearchDefaultViewSchema>;
export type TmdbSerieDetailsDefaultView = z.infer<typeof TmdbSerieDetailsDefaultViewSchema>;
export type TmdbSerieDetailsSeasonDefaultView = z.infer<typeof TmdbSerieDetailsSeasonDefaultViewSchema>;
export type TmdbSerieCreditDefaultView = z.infer<typeof TmdbSerieCreditDefaultViewSchema>;
export type TmdbSerieSeasonDetailsDefaultView = z.infer<typeof TmdbSerieSeasonDetailsDefaultViewSchema>;
