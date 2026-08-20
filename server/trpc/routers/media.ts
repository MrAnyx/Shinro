import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CollectionMediaCreateManyInput } from "~~/lib/prisma/models";

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

	getCollections: protectedProcedure
		.input(
			z.object({
				id: ServerMediaValidation.id.optional(),
				externalId: ServerMediaValidation.externalId.optional(),
			}),
		)
		.output(z.array(CollectionDefaultViewSchema))
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

	updateCollections: protectedProcedure
		.input(
			z.object({
				id: ServerMediaValidation.id,
				collectionIds: z.array(ServerCollectionValidation.id),
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const media = await prisma.media.findFirst({
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
				const ownedCollections = await prisma.collection.findMany({
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

			await prisma.$transaction(async (tx) => {
				await tx.collectionMedia.deleteMany({
					where: { mediaId: input.id },
				});

				if (input.collectionIds.length > 0) {
					const collectionsToCreate = input.collectionIds.map(
						(collectionId) =>
							({
								mediaId: input.id,
								collectionId,
							}) as CollectionMediaCreateManyInput,
					);

					await tx.collectionMedia.createMany({
						data: collectionsToCreate,
					});
				}
			});
		}),
});
