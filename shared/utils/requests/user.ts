import * as z from "zod";

import { UserDefaultViewSchema } from "#shared/utils/models/user";
import { UserValidation } from "#shared/utils/validations/user";

// Register
export const UserRegisterInputSchema = z.object({
	username: UserValidation.username,
	password: UserValidation.password,
});
export const UserRegisterOutputSchema = UserDefaultViewSchema;

// Login
export const UserLoginInputSchema = z.object({
	username: UserValidation.username,
	password: UserValidation.password,
});
export const UserLoginOutputSchema = UserDefaultViewSchema;

// Logout
export const UserLogoutInputSchema = z.void();
export const UserLogoutOutputSchema = z.void();

// Me
export const UserMeInputSchema = z.void();
export const UserOutputSchema = UserDefaultViewSchema;
