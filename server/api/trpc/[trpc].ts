import { createTRPCNuxtHandler } from "trpc-nuxt/server";
// Import { z } from "zod";

/**
 * This is the API-handler of your app that contains all your API routes.
 * On a bigger app, you will probably want to split this file up into multiple files.
 */
import { publicProcedure, router } from "../../trpc/init";

const appRouter = router({
	greeting: publicProcedure
		// This is the input schema of your procedure
		// 💡 Tip: Try changing this and see type errors on the client straight away
		.query(() => ({
			text: `Hello World!`,
			// 💡 Tip: Try adding a new property here and see it propagate to the client straight-away
		})),
	// 💡 Tip: Try adding a new procedure here and see if you can use it in the client!
	// GetUser: t.procedure.query(() => {
	//   Return { id: '1', name: 'bob' };
	// }),
});

// Export only the type definition of the API
// None of the actual implementation is exposed to the client
export type AppRouter = typeof appRouter;

export default createTRPCNuxtHandler({
	createContext: () => ({}),
	endpoint: "/api/trpc",
	router: appRouter,
});
