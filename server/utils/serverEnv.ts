import { z } from "zod";

export const serverEnvSchema = z.object({
	// Private variables
	NODE_ENV: z.enum(["production", "development"]),
	DATABASE_URL: z.url(),

	// TMDB variables
	TMDB_TOKEN: z.string(),
	TMDB_LANGUAGE: z.string(),
	TMDB_INCLUDE_NSFW: z.stringbool(),

	// Spotify variables
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string(),

	// Public variables
	NUXT_PUBLIC_ALLOW_REGISTRATION: z.stringbool(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Here, we export the variable directly because the environment varables are accessible at any time.
// eslint-disable-next-line node/no-process-env
export const serverEnv = process.env.CI ? ({} as ServerEnv) : serverEnvSchema.parse(process.env);
