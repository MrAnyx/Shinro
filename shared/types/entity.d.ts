import type z from "zod";

export type User = z.infer<typeof userRule>;
