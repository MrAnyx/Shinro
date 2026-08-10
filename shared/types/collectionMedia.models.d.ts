import { z } from "zod";

export type CollectionMediaDefaultView = z.infer<typeof CollectionMediaDefaultViewSchema>;
export type CollectionMediaWithCollectionView = z.infer<typeof CollectionMediaWithCollectionViewSchema>;
export type CollectionMediaWithMediaView = z.infer<typeof CollectionMediaWithMediaViewSchema>;
