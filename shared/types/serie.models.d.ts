import { z } from "zod";

export type SerieDefaultView = z.infer<typeof SerieDefaultViewSchema>;
export type SerieWithMediaView = z.infer<typeof SerieWithMediaViewSchema>;
