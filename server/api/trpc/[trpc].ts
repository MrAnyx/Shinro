import { createContext } from "@@/server/trpc/init";
import { appRouter } from "@@/server/trpc/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const log = useLogger("trpc");

export default defineEventHandler((event) =>
	fetchRequestHandler({
		allowBatching: true,
		createContext: () => createContext(event),
		endpoint: "/api/trpc",
		maxBatchSize: 10,
		onError({ error }) {
			log.error(error);
		},
		req: toWebRequest(event),
		router: appRouter,
	}),
);
