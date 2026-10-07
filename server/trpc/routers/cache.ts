import { z } from "zod";

import { router, adminProcedure } from "#server/trpc/init";

export default router({
	/**
	 * Clear all the cache in Redis. This is an admin-only operation and should be used with caution.
	 */
	clear: adminProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async () => {
			const storage = useStorage("redis");
			await storage.clear();
		}),
});
