import * as z from "zod";

// Register
export type UserRegisterInput = z.infer<typeof UserRegisterInputSchema>;
export type UserRegisterOutput = z.infer<typeof UserRegisterOutputSchema>;

// Login
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;
export type UserLoginOutput = z.infer<typeof UserLoginOutputSchema>;

// Logout
export type UserLogoutInput = z.infer<typeof UserLogoutInputSchema>;
export type UserLogoutOutput = z.infer<typeof UserLogoutOutputSchema>;

// Me
export type UserMeInput = z.infer<typeof UserMeInputSchema>;
export type UserMeOutput = z.infer<typeof UserOutputSchema>;
