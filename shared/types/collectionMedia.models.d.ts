import { z } from "zod";

export type BaseCollectionMedia = z.infer<typeof BaseCollectionMediaSchema>;
export type CollectionMedia = z.infer<typeof CollectionMediaSchema>;
export type CollectionMediaWithCollection = z.infer<typeof CollectionMediaWithCollectionSchema>;
export type CollectionMediaWithMedia = z.infer<typeof CollectionMediaWithMediaSchema>;
