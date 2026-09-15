import { z } from "zod";

export const clientEnvSchema = z.object({
	// Public variables
	allowRegistration: z.boolean(),
	enableMovies: z.boolean(),
	enableSeries: z.boolean(),
	enableMusics: z.boolean(),
	enableBooks: z.boolean(),
	enableGames: z.boolean(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
