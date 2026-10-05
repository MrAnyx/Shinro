import { z } from "zod";

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonWithMedia = z.infer<typeof SeasonWithMediaSchema>;
