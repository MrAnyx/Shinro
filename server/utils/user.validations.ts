import { z } from "zod";

import { Prisma } from "#prisma/client";

export const ServerUserValidation = {
	username: UserUsernameSchemaBase,
	password: UserPasswordSchemaBase,

	sort: z.enum(Prisma.UserScalarFieldEnum),
};
