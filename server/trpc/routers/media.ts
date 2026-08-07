import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: ServerMediaValidation.orderBy,
			}),
		)
		.output(PaginatedSchema(MediaDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
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
					orderBy: [{ name: "asc" }, { createdAt: "asc" }],
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
				}),
			]);

			return {
				total,
				results,
			};
		}),
});
