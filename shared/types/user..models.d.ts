import * as z from "zod";

export type UserBase = z.infer<typeof UserBaseSchema>;

export type UserDefaultView = z.infer<typeof UserDefaultViewSchema>;
