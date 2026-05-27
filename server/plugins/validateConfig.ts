import { z } from "zod";

const runtimeEnvSchema = z.object({
	jwtSecret: z.string().min(50),
	databaseUrl: z.string(),
	public: z.object({
		allowRegistration: z.boolean(),
	}),
});

export default defineNitroPlugin(() => {
	const log = useLogger("config");

	const runtimeConfig = useRuntimeConfig();

	const runtimeConfigResult = runtimeEnvSchema.safeParse(runtimeConfig);

	if (!runtimeConfigResult.success) {
		log.error(
			"Invalid runtime configuration",
			JSON.stringify(z.treeifyError(runtimeConfigResult.error)),
		);
		throw createError({
			statusCode: 500,
			statusMessage: "Invalid runtime configuration",
			fatal: true, // Ensures Nitro stops the server,
		});
	}

	log.success("Environment variables are valid");
});
