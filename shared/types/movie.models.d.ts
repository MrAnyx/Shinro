import { z } from "zod";

export type MovieDefaultView = z.infer<typeof MovieDefaultViewSchema>;
export type MovieWithMediaView = z.infer<typeof MovieWithMediaViewSchema>;
