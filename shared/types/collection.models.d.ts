import { z } from "zod";

export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionWithMedias = z.infer<typeof CollectionWithMediasSchema>;
