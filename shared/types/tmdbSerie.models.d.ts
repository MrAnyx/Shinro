import { z } from "zod";

export type TmdbSerieSearch = z.infer<typeof TmdbSerieSearchSchema>;
export type TmdbSerieDetails = z.infer<typeof TmdbSerieDetailsSchema>;
export type TmdbSerieDetailsSeason = z.infer<typeof TmdbSerieDetailsSeasonSchema>;
export type TmdbSerieCredit = z.infer<typeof TmdbSerieCreditSchema>;
export type TmdbSerieSeasonDetails = z.infer<typeof TmdbSerieSeasonDetailsSchema>;
