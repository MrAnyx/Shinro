import { createEnv } from "@t3-oss/env-nuxt";
import * as z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string(),
		JWT_SECRET: z.string().min(50),
		NODE_ENV: z.enum(["production", "development"]),
	},
	client: {
		NUXT_PUBLIC_ALLOW_REGISTRATION: z.coerce.boolean(),
	},
});
