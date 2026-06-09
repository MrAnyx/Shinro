import { defineConfig } from "prisma/config";
import "dotenv/config";

import env from "./server/utils/env";

export default defineConfig({
	schema: "./server/prisma/schema.prisma",
	migrations: {
		path: "./server/prisma/migrations",
	},
	datasource: {
		url: env.DATABASE_URL,
	},
});
