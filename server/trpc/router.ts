import { router } from "#server/trpc/init";
import { usersRouter } from "#server/trpc/routers/users";

export const appRouter = router({
	user: usersRouter,
});

// Export the type only — never import this on the client
export type AppRouter = typeof appRouter;
