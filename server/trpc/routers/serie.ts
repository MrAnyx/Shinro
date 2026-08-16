import { z } from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await prisma.movie.count({
				where: {
					media: {
						ownerId: ctx.user.id,
					},
				},
			});
		}),
});
