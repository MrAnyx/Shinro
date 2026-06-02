import type { AppRouter } from "@@/server/trpc/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

export default defineNuxtPlugin(() => {
	const client = createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				maxItems: 10,
				maxURLLength: 2048,
				url: "/api/trpc",
				transformer: superjson,
			}),
		],
	});

	return {
		provide: {
			trpc: client,
		},
	};
});
