import { z } from "zod";

export type BaseMedia = z.infer<typeof BaseMediaSchema>;
export type Media = z.infer<typeof MediaSchema>;

export type MovieMedia = z.infer<typeof MovieMediaSchema>;

export type AnyMedia = z.infer<typeof AnyMediaSchema>;
