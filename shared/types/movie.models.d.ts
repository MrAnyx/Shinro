import * as z from "zod";

export type MovieBase = z.infer<typeof MovieBaseSchema>;
export type MovieDefaultView = z.infer<typeof MovieDefaultViewSchema>;
export type MovieWithCollectionsView = z.infer<typeof MovieWithCollectionsViewSchema>;
