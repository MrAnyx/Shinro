import { z } from "zod";

export type TmdbSerieSearchDefaultView = z.infer<typeof TmdbSerieSearchDefaultViewSchema>;
export type TmdbSerieDetailsDefaultView = z.infer<typeof TmdbSerieDetailsDefaultViewSchema>;
export type TmdbSerieDetailsSeasonDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbSerieDetailsDefaultViewSchema>["seasons"]>[number]
>;
export type TmdbSerieCreditsDefaultView = z.infer<typeof TmdbSerieCreditsDefaultViewSchema>;
export type TmdbSerieCreditsCastDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbSerieCreditsDefaultViewSchema>["cast"]>[number]
>;
export type TmdbSerieSeasonDetailsDefaultView = z.infer<typeof TmdbSerieSeasonDetailsDefaultViewSchema>;
export type TmdbSerieSeasonDetailsEpisodeDefaultView = NonNullable<
	NonNullable<z.infer<typeof TmdbSerieSeasonDetailsDefaultViewSchema>["episodes"]>[number]
>;
export type TmdbSerieSeasonEpisodeDetailsDefaultView = z.infer<typeof TmdbSerieSeasonEpisodeDetailsDefaultViewSchema>;
