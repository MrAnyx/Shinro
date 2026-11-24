import { z } from "zod";

export const serverEnvSchema = z
	.object({
		// Private variables
		NODE_ENV: z.enum(["production", "development"]),
		DATABASE_URL: z.url(),
		REDIS_URL: z.url(),
		// Optional override; when unset, the Secure flag follows the request protocol (incl. X-Forwarded-Proto).
		COOKIE_SECURE: z.preprocess((value) => (value === "" ? undefined : value), z.stringbool().optional()),
		SESSION_LIFETIME_DAYS: z.preprocess(
			(value) => (value === "" ? undefined : value),
			z.coerce.number().int().min(1).max(365).default(10),
		),

		// TMDB variables
		TMDB_TOKEN: z.string().optional(),
		TMDB_LANGUAGE: z.string().optional(),
		TMDB_INCLUDE_NSFW: z.stringbool().optional(),

		// Spotify variables
		SPOTIFY_CLIENT_ID: z.string().optional(),
		SPOTIFY_CLIENT_SECRET: z.string().optional(),

		// Public variables
		NUXT_PUBLIC_ALLOW_REGISTRATION: z.stringbool(),
		NUXT_PUBLIC_ENABLE_MOVIES: z.stringbool(),
		NUXT_PUBLIC_ENABLE_SERIES: z.stringbool(),
		NUXT_PUBLIC_ENABLE_MUSICS: z.stringbool(),
		NUXT_PUBLIC_ENABLE_BOOKS: z.stringbool(),
		NUXT_PUBLIC_ENABLE_GAMES: z.stringbool(),
	})
	.superRefine((env, ctx) => {
		const requireWhenEnabled = (flag: keyof typeof env, keys: (keyof typeof env)[]) => {
			if (!env[flag]) {
				return;
			}

			for (const key of keys) {
				if (env[key] === undefined || env[key] === "") {
					ctx.addIssue({ code: "custom", path: [key], message: `required when ${flag} is true` });
				}
			}
		};

		requireWhenEnabled("NUXT_PUBLIC_ENABLE_MOVIES", ["TMDB_TOKEN", "TMDB_LANGUAGE", "TMDB_INCLUDE_NSFW"]);
		requireWhenEnabled("NUXT_PUBLIC_ENABLE_MUSICS", ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"]);
	});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const parseServerEnv = (env: NodeJS.ProcessEnv): ServerEnv => {
	const result = serverEnvSchema.safeParse(env);

	if (!result.success) {
		const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
		const error = new Error(`Invalid environment variables: ${issues}`);
		// Nitro neither logs bundle-load errors nor keeps a ZodError message, so log it explicitly
		console.error(error);
		throw error;
	}

	return result.data;
};

// Here, we export the variable directly because the environment varables are accessible at any time.
// eslint-disable-next-line node/no-process-env
export const serverEnv = process.env.CI ? ({} as ServerEnv) : parseServerEnv(process.env);
