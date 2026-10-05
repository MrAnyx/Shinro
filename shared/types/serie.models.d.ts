import { z } from "zod";

export type Serie = z.infer<typeof SerieSchema>;
export type SerieWithMedia = z.infer<typeof SerieWithMediaSchema>;
