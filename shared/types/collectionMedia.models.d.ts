import { z } from "zod";

export type CollectionMedia = z.infer<typeof CollectionMediaSchema>;
export type CollectionMediaWithCollection = z.infer<typeof CollectionMediaWithCollectionSchema>;
export type CollectionMediaWithMedia = z.infer<typeof CollectionMediaWithMediaSchema>;
