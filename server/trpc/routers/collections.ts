import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				name: ServerCollectionValidation.name,
				description: ServerCollectionValidation.description,
				favorite: ServerCollectionValidation.favorite,
			}),
		)
		.output(CollectionDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const collection = await prisma.collection.create({
				data: {
					name: input.name,
					description: input.description,
					favorite: input.favorite,
					ownerId: ctx.user.id,
				},
			});

			return collection;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerCollectionValidation.id,
				name: ServerCollectionValidation.name.optional(),
				description: ServerCollectionValidation.description.optional(),
				favorite: ServerCollectionValidation.favorite.optional(),
			}),
		)
		.output(CollectionDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const existingCollection = await prisma.collection.findFirst({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			if (!existingCollection) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Collection not found",
				});
			}

			const collection = await prisma.collection.update({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
				data: {
					name: input.name ?? Prisma.skip,
					description: input.description === undefined ? Prisma.skip : input.description,
					favorite: input.favorite === undefined ? Prisma.skip : input.favorite,
				},
			});

			return collection;
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerCollectionValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const existingCollection = await prisma.collection.findFirst({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			if (!existingCollection) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Collection not found",
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
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
			}),
		)
		.output(PaginatedSchema(CollectionDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const where: Prisma.CollectionWhereInput = {
				ownerId: ctx.user.id,
				...(input.search
					? {
							OR: [
								{ name: { contains: input.search, mode: "insensitive" } },
								{ description: { contains: input.search, mode: "insensitive" } },
							],
						}
					: {}),
			};
			const [total, results] = await Promise.all([
				prisma.collection.count({ where }),
				prisma.collection.findMany({
					where,
					orderBy: [{ name: "asc" }, { createdAt: "asc" }],
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
				}),
			]);
			return { total, results };
		}),
});
