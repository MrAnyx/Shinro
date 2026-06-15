import * as z from "zod";

export type User = z.infer<typeof UserSchema>;
