import { z } from "zod";

const EnvSchema = z.object({
	// Private variables
	NODE_ENV: z.enum(["production", "development"]),
	DATABASE_URL: z.url(),
	TMDB_TOKEN: z.string(),
	TMDB_LANGUAGE: z.string(),
	TMDB_INCLUDE_NSFW: z.stringbool(),

	// Public variables
	NUXT_PUBLIC_ALLOW_REGISTRATION: z.stringbool(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// eslint-disable-next-line node/no-process-env
export default EnvSchema.parse(process.env);
