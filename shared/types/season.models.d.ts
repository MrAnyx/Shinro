import { z } from "zod";

export type Season = z.infer<typeof SeasonSchema>;
