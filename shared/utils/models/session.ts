import * as z from "zod";

export const SessionBaseSchema = z.object({
	id: z.uuid(),
	sessionId: z.string(),
	userId: z.uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
	expiresAt: z.date(),
});
