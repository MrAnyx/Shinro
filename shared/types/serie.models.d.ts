import { z } from "zod";

export type BaseSerie = z.infer<typeof BaseSerieSchema>;
export type Serie = z.infer<typeof SerieSchema>;
