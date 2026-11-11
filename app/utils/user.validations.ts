import { z } from "zod";

export const ClientUserValidation = {
	username: UserUsernameSchemaBase,
	password: UserPasswordSchemaBase,
	passwordOptional: z.union([UserPasswordSchemaBase, z.literal("")]).optional(),
	passwordConfirmation: z
		.object({
			password: UserPasswordSchemaBase,
			password_confirmation: UserPasswordSchemaBase,
		})
		.refine((data) => data.password === data.password_confirmation, {
			message: "Passwords must match",
			path: ["password_confirmation"],
		}),
};
