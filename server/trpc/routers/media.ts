import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	/**
	 * Get all the collections for the authenticated user, with pagination, search and sorting.
	 * If the force flag is set to true, all the medias will be returned without pagination.
	 */
	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: SortableSchema(ServerMediaValidation.sort),
			}),
		)
		.output(PaginatedSchema(MediaSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy = buildPrismaOrderBy<Prisma.MediaOrderByWithRelationInput>(input.orderBy);

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

	/**
	 * Get all the collections for a specific media for the authenticated user.
	 */
	getCollections: protectedProcedure
		.input(
			z.object({
				id: ServerMediaValidation.id.optional(),
				externalId: ServerMediaValidation.externalId.optional(),
			}),
		)
		.output(z.array(CollectionSchema))
		.query(async ({ input, ctx }) => {
			if (!input.id && !input.externalId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Either id or externalId must be specified",
				});
			}

			const mediaFilter: Prisma.MediaWhereInput = input.id ? { id: input.id } : { externalId: input.externalId };

			const media = await prisma.media.findFirst({
				where: {
					...mediaFilter,
					ownerId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			if (!media) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Media not found",
				});
			}

			const collections = await prisma.collectionMedia.findMany({
				where: {
					mediaId: media.id,
					media: {
						ownerId: ctx.user.id,
					},
					collection: {
						ownerId: ctx.user.id,
					},
				},
				select: {
					collection: true,
				},
			});

			return collections.map((x) => x.collection);
		}),

	/**
	 * Update the collections for a specific media for the authenticated user.
	 */
	updateCollections: protectedProcedure
		.input(
			z.object({
				id: ServerMediaValidation.id,
				collectionIds: z.array(ServerCollectionValidation.id),
			}),
		)
		.output(z.array(CollectionSchema))
		.mutation(async ({ input, ctx }) => {
			return await prisma.$transaction(async (tx) => {
				const media = await tx.media.findFirst({
					where: {
						id: input.id,
						ownerId: ctx.user.id,
					},
					select: {
						id: true,
					},
				});

				if (!media) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Media not found",
					});
				}

				if (input.collectionIds.length > 0) {
					const ownedCollections = await tx.collection.findMany({
						where: {
							id: {
								in: input.collectionIds,
							},
							ownerId: ctx.user.id,
						},
						select: {
							id: true,
						},
					});

					if (ownedCollections.length !== input.collectionIds.length) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "One or more selected collections are invalid",
						});
					}
				}

				const collections = await tx.media.update({
					where: { id: input.id },
					data: {
						collections: {
							deleteMany: {
								mediaId: input.id,
							},
							...(input.collectionIds.length > 0 && {
								createMany: {
									data: input.collectionIds.map((collectionId) => ({
										collectionId,
									})),
								},
							}),
						},
					},
					include: {
						collections: {
							include: {
								collection: true,
							},
						},
					},
				});

				return collections.collections.map((c) => c.collection);
			});
		}),
});
