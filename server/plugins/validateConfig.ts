import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string().min(50),
});

const runtimeEnvSchema = z.object({
	public: z.object({}),
});

export default defineNitroPlugin(() => {
	const log = useLogger("config");

	const runtimeConfig = useRuntimeConfig();

	const envResult = envSchema.safeParse(process.env);
	const runtimeConfigResult = runtimeEnvSchema.safeParse(runtimeConfig);

	if (!envResult.success) {
		log.error(z.treeifyError(envResult.error));
		process.exit(1);
	}

	if (!runtimeConfigResult.success) {
		log.error(z.treeifyError(runtimeConfigResult.error));
		process.exit(1);
	}

	log.success("Environment variables are valid");
});
