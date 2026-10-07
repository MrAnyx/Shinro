import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	/**
	 * Create a new collection for the authenticated user.
	 */
	create: protectedProcedure
		.input(
			z.object({
				name: ServerCollectionValidation.name,
				description: ServerCollectionValidation.description,
				favorite: ServerCollectionValidation.favorite,
			}),
		)
		.output(CollectionSchema)
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

	/**
	 * Update an existing collection for the authenticated user.
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: ServerCollectionValidation.id,
				name: ServerCollectionValidation.name.optional(),
				description: ServerCollectionValidation.description.optional(),
				favorite: ServerCollectionValidation.favorite.optional(),
			}),
		)
		.output(CollectionSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.$transaction(async (tx) => {
				const existingCollection = await tx.collection.findFirst({
					where: {
						id: input.id,
					},
					select: {
						id: true,
						ownerId: true,
					},
				});

				if (!existingCollection) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Collection not found",
					});
				}

				if (existingCollection.ownerId !== ctx.user.id) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Your are not the owner of this collection",
					});
				}

				const { name = Prisma.skip, description = Prisma.skip, favorite = Prisma.skip } = input;

				const collection = await tx.collection.update({
					where: {
						id: input.id,
						ownerId: ctx.user.id,
					},
					data: {
						name,
						description,
						favorite,
					},
				});

				return collection;
			});
		}),

	/**
	 * Delete an existing collection for the authenticated user.
	 */
	delete: protectedProcedure
		.input(
			z.object({
				id: ServerCollectionValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(async (tx) => {
				const existingCollection = await tx.collection.findFirst({
					where: {
						id: input.id,
					},
					select: {
						id: true,
						ownerId: true,
					},
				});

				if (!existingCollection) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Collection not found",
					});
				}

				if (existingCollection.ownerId !== ctx.user.id) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Your are not the owner of this collection",
					});
				}

				await tx.collection.delete({
					where: {
						id: input.id,
						ownerId: ctx.user.id,
					},
				});
			});
		}),

	/**
	 * Count the number of collections for the authenticated user.
	 */
	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await prisma.collection.count({
				where: {
					ownerId: ctx.user.id,
				},
			});
		}),

	/**
	 * Get all the favorite collections for the authenticated user, including their medias.
	 */
	getFavoritesWithMedias: protectedProcedure
		.input(z.void())
		.output(z.array(CollectionWithMediasSchema))
		.query(async ({ ctx }) => {
			return await prisma.collection.findMany({
				where: {
					ownerId: ctx.user.id,
					favorite: true,
				},
				orderBy: [{ name: "asc" }, { createdAt: "desc" }],
				include: {
					medias: {
						orderBy: [{ addedAt: "desc" }],
						include: {
							media: true,
						},
					},
				},
			});
		}),

	/**
	 * Get all the collections for the authenticated user, with pagination, search and sorting.
	 * If the force flag is set to true, all the collections will be returned without pagination.
	 */
	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: SortableSchema(ServerCollectionValidation.sort),
			}),
		)
		.output(PaginatedSchema(CollectionSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy: Prisma.CollectionOrderByWithRelationInput[] = input.orderBy.map(({ sort, order }) => ({
				[sort]: order,
			}));

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
					orderBy,
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
				}),
			]);

			return { total, results };
		}),

	/**
	 * Get a collection by its ID for the authenticated user.
	 */
	getById: protectedProcedure
		.input(
			z.object({
				id: ServerCollectionValidation.id,
			}),
		)
		.output(CollectionSchema)
		.query(async ({ input, ctx }) => {
			const collection = await prisma.collection.findFirst({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
			});

			if (!collection) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Collection not found",
				});
			}

			return collection;
		}),
});
