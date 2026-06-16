import * as z from "zod";

export type User = z.infer<typeof UserSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
