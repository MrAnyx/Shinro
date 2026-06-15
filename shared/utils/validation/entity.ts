import * as z from "zod";

export const UserSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	role: z.enum(["ADMIN", "USER"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});
