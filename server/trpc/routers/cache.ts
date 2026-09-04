import { z } from "zod";

import { router, adminProcedure } from "#server/trpc/init";

export default router({
	clear: adminProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async () => {
			const storage = useStorage("redis");
			await storage.clear();
		}),
});
