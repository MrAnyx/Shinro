import { router } from "#server/trpc/init";
import { usersRouter } from "#server/trpc/routers/users";

export const appRouter = router({
	users: usersRouter,
});

export type AppRouter = typeof appRouter;
