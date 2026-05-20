import { router } from "./init";
import { usersRouter } from "./routers/users";

export const appRouter = router({
	users: usersRouter,
});

// Export the type only — never import this on the client
export type AppRouter = typeof appRouter;
