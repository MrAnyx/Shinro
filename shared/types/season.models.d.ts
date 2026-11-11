import { z } from "zod";

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonWithSerie = z.infer<typeof SeasonWithSerieSchema>;
export type SeasonEpisode = z.infer<typeof SeasonEpisodeSchema>;
export type ExternalSeasonDetails = z.infer<typeof ExternalSeasonDetailsSchema>;
