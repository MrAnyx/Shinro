import { z } from "zod";

export type TmdbSerieSearchDefaultView = z.infer<typeof TmdbSerieSearchDefaultViewSchema>;
export type TmdbSerieDetailsDefaultView = z.infer<typeof TmdbSerieDetailsDefaultViewSchema>;
export type TmdbSerieCreditsDefaultView = z.infer<typeof TmdbSerieCreditsDefaultViewSchema>;
