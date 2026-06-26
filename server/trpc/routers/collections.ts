import * as z from "zod";

import { Prisma } from "#server/prisma/generated/client";
import { router, protectedProcedure } from "#server/trpc/init";

const logger = useLogger("trpc:collection");

export const collectionRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				name: CollectionSchema.validation.name,
				description: CollectionSchema.validation.description,
			}),
		)
		.output(CollectionSchema.model)
		.mutation(async ({ input, ctx }) => {
			const collection = await prisma.collection.create({
				data: {
					name: input.name,
					description: input.description ?? null,
					ownerId: ctx.user.id,
				},
				include: {
					owner: true,
				},
			});

			return collection;
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.uuid(),
				name: CollectionSchema.validation.name,
				description: CollectionSchema.validation.description,
			}),
		)
		.output(CollectionSchema.model)
		.mutation(async ({ input, ctx }) => {
			const collection = await prisma.collection.update({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
				data: {
					name: input.name,
					description: input.description ?? null,
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
			const count = ITEMS_PER_PAGE;
			const skip = (input.page - 1) * count;

			const total = await prisma.collection.count({
				where: {
					ownerId: ctx.user.id,
				},
			});

			const results = await prisma.collection.findMany({
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
				total,
				results,
			};
		}),
});
