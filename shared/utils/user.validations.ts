import { z } from "zod";

export const UserUsernameSchemaBase = z
	.string("User username must be a valid string")
	.trim()
	.min(1, "User username can not be empty")
	.max(255, "User username can not exceed 255 characters")
	.refine((x) => /^[a-zA-Z0-9_.-]+$/.test(x), "User username can not contain special characters");

export const UserPasswordSchemaBase = z
	.string("User password must be a valid string")
	.min(16, "User password must be at least 16 characters")
	.refine((password) => /[A-Z]/.test(password), "User password must contain uppercase characters")
	.refine((password) => /[a-z]/.test(password), "User password must contain lowercase characters")
	.refine((password) => /[0-9]/.test(password), "User password must contain digits")
	.refine((password) => /[!?@#$%^&*]/.test(password), "User password must contain special characters");
