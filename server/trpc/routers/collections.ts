import * as z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

const logger = useLogger("trpc:collection");

export const collectionRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				name: CollectionSchema.validation.name,
			}),
		)
		.output(CollectionSchema.model)
		.mutation(async ({ input, ctx }) => {
			const collection = await prisma.collection.create({
				data: {
					name: input.name,
					ownerId: ctx.user.id,
				},
				include: {
					owner: true,
				},
			});

			return collection;
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			const count = await prisma.collection.count({
				where: {
					ownerId: ctx.user.id,
				},
			});

			return count;
		}),
	getAll: protectedProcedure
		.input(PaginationSchema.model)
		.output(PaginatedSchema(CollectionSchema.model))
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
