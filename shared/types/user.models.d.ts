import { z } from "zod";

export type UserDefaultView = z.infer<typeof UserDefaultViewSchema>;
