import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma } from "#prisma/client";
import type { CollectionMediaCreateManyInput } from "#prisma/models";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				overview: ServerMovieValidation.overview,
				rating: ServerMediaValidation.rating,
				note: ServerMediaValidation.note,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.movie.create({
				data: {
					media: {
						create: {
							name: input.name,
							type: MediaType.MOVIE,
							ownerId: ctx.user.id,
							rating: input.rating,
							note: input.note,
						},
					},
					overview: input.overview,
				},
				include: {
					media: true,
				},
			});
		}),

	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalId: ServerTmdbMovieValidation.id,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const movieExist = await prisma.movie.findFirst({
				where: {
					media: {
						ownerId: ctx.user.id,
						externalId: input.externalId,
					},
				},
				select: {
					id: true,
				},
			});

			if (movieExist) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This movie as already been added",
				});
			}

			const tmdbMovie = await tmdb(`/movie/${input.externalId}`, {
				schema: TmdbMovieDetailsResponseSchema,
			});

			const movie = await prisma.movie.create({
				data: {
					media: {
						create: {
							externalId: tmdbMovie.id,
							name: tmdbMovie.title ?? null,
							type: MediaType.MOVIE,
							ownerId: ctx.user.id,
							imagePath: tmdbMovie.poster_path ?? null,
							imageType: ImageType.TMDB,
						},
					},
					overview: tmdbMovie.overview ?? null,
				},
				include: {
					media: true,
				},
			});

			return movie;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
				name: ServerMediaValidation.name.optional(),
				overview: ServerMovieValidation.overview.optional(),
				rating: ServerMediaValidation.rating.optional(),
				note: ServerMediaValidation.note.optional(),
			}),
		)
		.output(MovieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const existingMovie = await prisma.movie.findFirst({
				where: {
					id: input.id,
					media: {
						ownerId: ctx.user.id,
					},
				},
				select: {
					id: true,
					media: {
						select: {
							ownerId: true,
						},
					},
				},
			});

			if (!existingMovie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Movie not found",
				});
			}

			const { name = Prisma.skip, rating = Prisma.skip, overview = Prisma.skip, note = Prisma.skip } = input;

			return await prisma.movie.update({
				where: {
					id: input.id,
					media: {
						ownerId: ctx.user.id,
					},
				},
				data: {
					media: {
						update: {
							name,
							rating,
							note,
						},
					},
					overview,
				},
				include: {
					media: true,
				},
			});
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const existingMovie = await prisma.movie.findFirst({
				where: {
					id: input.id,
					media: {
						ownerId: ctx.user.id,
					},
				},
				select: {
					id: true,
					media: {
						select: {
							ownerId: true,
						},
					},
				},
			});

			if (!existingMovie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Movie not found",
				});
			}
			// Use the media model to leverage the cascade on delete feature
			await prisma.media.deleteMany({
				where: {
					ownerId: ctx.user.id,
					id: input.id,
				},
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await prisma.movie.count({
				where: {
					media: {
						ownerId: ctx.user.id,
					},
				},
			});
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: SortableSchema(ServerMovieValidation.sort),
			}),
		)
		.output(PaginatedSchema(MovieWithMediaViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy: Prisma.MovieOrderByWithRelationInput[] = input.orderBy.map(({ sort, order }) => ({
				[sort]: order,
			}));

			const where: Prisma.MovieWhereInput = {
				media: {
					ownerId: ctx.user.id,
				},
				...(input.search
					? {
							OR: [
								{ media: { name: { contains: input.search, mode: "insensitive" } } },
								{ overview: { contains: input.search, mode: "insensitive" } },
							],
						}
					: {}),
			};

			const [total, results] = await Promise.all([
				prisma.movie.count({ where }),
				prisma.movie.findMany({
					where,
					orderBy,
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
					include: {
						media: true,
					},
				}),
			]);

			return { total, results };
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id.optional(),
				externalId: ServerTmdbMovieValidation.id.optional(),
			}),
		)
		.output(MovieWithMediaViewSchema)
		.query(async ({ input, ctx }) => {
			if (!input.id && !input.externalId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Either id or externalId must be specified",
				});
			}

			const mediaFilter: Prisma.MediaWhereInput = input.id ? { id: input.id } : { externalId: input.externalId };

			const movie = await prisma.movie.findFirst({
				where: {
					media: {
						...mediaFilter,
						ownerId: ctx.user.id,
					},
				},
				include: {
					media: true,
				},
			});

			if (!movie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Movie not found",
				});
			}

			return movie;
		}),

	getCollections: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id.optional(),
				externalId: ServerTmdbMovieValidation.id.optional(),
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

			const movie = await prisma.movie.findFirst({
				where: {
					media: {
						...mediaFilter,
						ownerId: ctx.user.id,
					},
				},
				select: {
					id: true,
				},
			});

			if (!movie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Movie not found",
				});
			}

			const collections = await prisma.collectionMedia.findMany({
				where: {
					mediaId: movie.id,
					media: {
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
				id: ServerMovieValidation.id,
				collectionIds: z.array(ServerCollectionValidation.id),
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const movie = await prisma.movie.findFirst({
				where: {
					id: input.id,
					media: {
						ownerId: ctx.user.id,
					},
				},
				select: {
					id: true,
				},
			});

			if (!movie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Movie not found",
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
