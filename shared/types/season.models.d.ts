import { z } from "zod";

export type BaseSeason = z.infer<typeof BaseSeasonSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type SeasonWithSerie = z.infer<typeof SeasonWithSerieSchema>;
