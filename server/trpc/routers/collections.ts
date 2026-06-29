import { TRPCError } from "@trpc/server";
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
			const existingCollection = await prisma.collection.findUnique({
				where: {
					id: input.id,
				},
			});

			if (existingCollection?.ownerId !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not the owner of this collection",
				});
			}

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
	delete: protectedProcedure
		.input(
			z.object({
				id: z.uuid(),
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const existingCollection = await prisma.collection.findUnique({
				where: {
					id: input.id,
				},
			});

			if (existingCollection?.ownerId !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not the owner of this collection",
				});
			}

			await prisma.collection.delete({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
			});
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
		.input(
			z.object({
				page: PaginationSchema.validation.page,
				search: PaginationSchema.validation.search,
			}),
		)
		.output(PaginatedSchema(CollectionSchema.model))
		.query(async ({ input, ctx }) => {
			throw new TRPCError({
				code: "BAD_REQUEST",
			});

			// const skip = (input.page - 1) * ITEMS_PER_PAGE;

			// const where: Prisma.CollectionWhereInput = {
			// 	ownerId: ctx.user.id,
			// 	...(input.search
			// 		? {
			// 				OR: [{ name: { contains: input.search, mode: "insensitive" } }, { description: { contains: input.search, mode: "insensitive" } }],
			// 			}
			// 		: {}),
			// };

			// const [total, results] = await Promise.all([
			// 	prisma.collection.count({ where }),
			// 	prisma.collection.findMany({
			// 		where,
			// 		orderBy: [{ name: "asc" }, { createdAt: "asc" }],
			// 		skip,
			// 		take: ITEMS_PER_PAGE,
			// 		include: { owner: true },
			// 	}),
			// ]);

			// return { total, results };
		}),
});
