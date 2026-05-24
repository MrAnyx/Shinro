import * as z from "zod";

export const usernameRule = z
	.string("Username is required")
	.max(255, "Can not exceed 255 characters")
	.nonempty("Can not be empty")
	.refine(
		(x) => /^[a-zA-Z0-9_.-]+$/.test(x),
		"Some characters are not allowed",
	);

export const passwordRule = z
	.string("Password is required")
	.min(16, "Must be at least 16 characters")
	.refine(
		(password) => /[A-Z]/.test(password),
		"Must contain uppercase characters",
	)
	.refine(
		(password) => /[a-z]/.test(password),
		"Must contain lowercase characters",
	)
	.refine((password) => /[0-9]/.test(password), "Must contain digits")
	.refine(
		(password) => /[!@#$%^&*]/.test(password),
		"Must contain special characters",
	);
