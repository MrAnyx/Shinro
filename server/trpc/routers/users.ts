import { z } from "zod";

import {
	router,
	publicProcedure,
	adminProcedure,
	protectedProcedure,
} from "../init";

export const usersRouter = router({
	listAll: publicProcedure.query(() => [
		{ id: "1", name: "Alice" },
		{ id: "2", name: "Bob" },
	]),

	login: publicProcedure.query(() => signJwt()),
});
