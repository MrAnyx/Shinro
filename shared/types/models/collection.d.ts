import * as z from "zod";

export type CollectionBase = z.infer<typeof CollectionBaseSchema>;

export type CollectionDefaultView = z.infer<typeof CollectionDefaultViewSchema>;
