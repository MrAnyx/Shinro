import { z } from "zod";

import { Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: SortableSchema(ServerMediaValidation.sort),
			}),
		)
		.output(PaginatedSchema(MediaDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy: Prisma.MediaOrderByWithRelationInput[] = input.orderBy.map(({ sort, order }) => ({
				[sort]: order,
			}));

			const where: Prisma.MediaWhereInput = {
				ownerId: ctx.user.id,
				...(input.search
					? {
							OR: [{ name: { contains: input.search, mode: "insensitive" } }],
						}
					: {}),
			};

			const [total, results] = await Promise.all([
				prisma.media.count({ where }),
				prisma.media.findMany({
					where,
					orderBy,
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
				}),
			]);

			return {
				total,
				results,
			};
		}),
});
