import * as z from "zod";

import { Role } from "#prisma/enums";

export const UserDefaultViewSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	passwordHash: z.string(),
	role: z.enum(Role),
	createdAt: z.date(),
	updatedAt: z.date(),
});
