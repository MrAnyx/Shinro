import { z } from "zod";

export type Media = z.infer<typeof MediaSchema>;

export type MovieMedia = z.infer<typeof MovieMediaSchema>;
export type SerieMedia = z.infer<typeof SerieMediaSchema>;
export type SeasonMedia = z.infer<typeof SeasonMediaSchema>;

export type AnyMedia = z.infer<typeof AnyMediaSchema>;
