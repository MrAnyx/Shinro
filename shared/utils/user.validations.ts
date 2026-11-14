import { z } from "zod";

export const USER_USERNAME_MAX_LENGTH = 255;

export const UserUsernameSchemaBase = z
	.string("User username must be a valid string")
	.trim()
	.min(1, "User username can not be empty")
	.max(USER_USERNAME_MAX_LENGTH, `User username can not exceed ${USER_USERNAME_MAX_LENGTH} characters`)
	.refine((x) => /^[a-zA-Z0-9_.-]+$/.test(x), "User username can not contain special characters");

export const USER_ADMIN_SETUP_TOKEN_MAX_LENGTH = 256;

export const UserAdminSetupTokenSchemaBase = z
	.string("Setup token must be a valid string")
	.trim()
	.min(1, "Setup token can not be empty")
	.max(
		USER_ADMIN_SETUP_TOKEN_MAX_LENGTH,
		`Setup token can not exceed ${USER_ADMIN_SETUP_TOKEN_MAX_LENGTH} characters`,
	);

export const UserPasswordSchemaBase = z
	.string("User password must be a valid string")
	.min(16, "User password must be at least 16 characters")
	.refine((password) => /[A-Z]/.test(password), "User password must contain uppercase characters")
	.refine((password) => /[a-z]/.test(password), "User password must contain lowercase characters")
	.refine((password) => /[0-9]/.test(password), "User password must contain digits")
	.refine((password) => /[!?@#$%^&*]/.test(password), "User password must contain special characters");
