import * as z from "zod";

export type User = z.infer<typeof UserSchema.entity>;
export type Collection = z.infer<typeof CollectionSchema.entity>;
