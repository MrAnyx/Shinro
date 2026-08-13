import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "#server/trpc/context";
import { appRouter } from "#server/trpc/router";

export default defineEventHandler((event) => {
	const log = useLogger(event);

	return fetchRequestHandler({
		endpoint: "/api/trpc",
		allowBatching: true,
		createContext: () => createContext(event),
		maxBatchSize: 10,
		onError({ error }) {
			log.error(error.message.trim(), { ...error });
		},
		req: toWebRequest(event),
		router: appRouter,
	});
});
