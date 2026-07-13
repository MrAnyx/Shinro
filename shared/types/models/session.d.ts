import * as z from "zod";

export type SessionBase = z.infer<typeof SessionBaseSchema>;
