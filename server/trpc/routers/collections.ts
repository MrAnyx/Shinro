import z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

const logger = useLogger("collection");

export const collectionRouter = router({
	getAll: protectedProcedure
		.input(PaginationSchema)
		.output(PaginatedSchema(CollectionSchema))
		.query(async ({ input, ctx }) => {
			const count = 50;
			const skip = (input.page - 1) * count;

			const collections = await prisma.collection.findMany({
				orderBy: {
					name: "asc",
				},
				where: {
					ownerId: ctx.user.id,
				},
				skip,
				take: count,
				include: {
					owner: true,
				},
			});

			return {
				currentPage: input.page,
				totalPages: 0,
				results: collections,
			};
		}),
});
