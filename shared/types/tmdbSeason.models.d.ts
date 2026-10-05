import { z } from "zod";

export type TmdbSeasonDetails = z.infer<typeof TmdbSeasonDetailsSchema>;
export type TmdbSeasonDetailsEpisode = z.infer<typeof TmdbSeasonDetailsEpisodeSchema>;
