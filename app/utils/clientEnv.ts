import { z } from "zod";

export const clientEnvSchema = z.object({
	// Public variables
	allowRegistration: z.boolean(),
	allowHomepage: z.boolean(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
