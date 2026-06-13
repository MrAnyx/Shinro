import { z } from "zod";

const EnvSchema = z.object({
	// Private variables
	NODE_ENV: z.string(),
	DATABASE_URL: z.url(),

	// Public variables
	NUXT_PUBLIC_ALLOW_REGISTRATION: z.coerce.boolean(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

// eslint-disable-next-line node/no-process-env
export default EnvSchema.parse(process.env);
