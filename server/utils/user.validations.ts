import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerUserValidation = {
	username: UserUsernameSchemaBase,
	password: UserPasswordSchemaBase,
	update: z
		.object({
			username: UserUsernameSchemaBase.optional(),
			password: UserPasswordSchemaBase.optional(),
		})
		.refine((input) => input.username !== undefined || input.password !== undefined, {
			message: "At least one profile field must be provided",
		}),

	sort: z.enum(Prisma.UserScalarFieldEnum),
};
