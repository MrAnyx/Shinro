import { z } from "zod";

export type MediaDefaultView = z.infer<typeof MediaDefaultViewSchema>;

export type MovieMediaView = z.infer<typeof MovieMediaViewSchema>;
export type SerieMediaView = z.infer<typeof SerieMediaViewSchema>;
export type AnyMediaView = z.infer<typeof AnyMediaViewSchema>;
