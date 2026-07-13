import * as z from "zod";

export const UserBaseSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	passwordHash: z.string(),
	role: z.enum(["ADMIN", "USER"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const UserDefaultViewSchema = UserBaseSchema.pick({
	id: true,
	username: true,
	role: true,
	createdAt: true,
	updatedAt: true,
});
