import { TRPCError } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "#server/trpc/context";
import { appRouter } from "#server/trpc/router";

const logger = useLogger("trpc:api");

export default defineEventHandler((event) =>
	fetchRequestHandler({
		allowBatching: true,
		createContext: () => createContext(event),
		endpoint: "/api/trpc",
		maxBatchSize: 10,
		onError({ error }) {
			logger.error(error.message.trim());
		},
		req: toWebRequest(event),
		router: appRouter,
	}),
);
