import { z } from "zod";

export type Movie = z.infer<typeof MovieSchema>;
export type MovieWithMedia = z.infer<typeof MovieWithMediaSchema>;
