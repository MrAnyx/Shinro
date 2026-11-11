import { z } from "zod";

export type EpisodeWithParents = z.infer<typeof EpisodeWithParentsSchema>;
export type EpisodeDetails = z.infer<typeof EpisodeDetailsSchema>;
