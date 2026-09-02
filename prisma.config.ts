import { defineConfig } from "prisma/config";
import "dotenv/config";

import { serverEnv } from "./server/utils/serverEnv";

export default defineConfig({
	schema: "./server/prisma/schema.prisma",
	migrations: {
		path: "./server/prisma/migrations",
	},
	datasource: {
		url: serverEnv.DATABASE_URL,
	},
});
