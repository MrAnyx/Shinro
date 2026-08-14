import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "~~/server/trpc/router";

export default defineNuxtPlugin(() => {
	const client = createTRPCClient<AppRouter>({
		links: [
			httpLink({
				// maxItems: 10,
				// maxURLLength: 2048,
				url: "/api/trpc",
				transformer,
				methodOverride: "POST",
			}),
		],
	});

	return {
		provide: {
			trpc: client,
		},
	};
});
