import { createContext } from "@@/server/trpc/init";
import { appRouter } from "@@/server/trpc/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export default defineEventHandler((event) =>
	fetchRequestHandler({
		createContext: () => createContext(event),
		endpoint: "/api/trpc",
		onError({ error }) {
			const log = useLogger();

			if (error.code === "INTERNAL_SERVER_ERROR") {
				log.error("tRPC error:", error);
			}
		},
		req: toWebRequest(event),
		router: appRouter,
	}),
);
