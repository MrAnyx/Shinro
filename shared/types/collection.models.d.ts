import * as z from "zod";

export type CollectionDefaultView = z.infer<typeof CollectionDefaultViewSchema>;
export type CollectionWithMediasView = z.infer<typeof CollectionWithMediasViewSchema>;
