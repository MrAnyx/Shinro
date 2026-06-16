import * as z from "zod";

export const UserSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	role: z.enum(["ADMIN", "USER"]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CollectionSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	owner: UserSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});
