import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { MediaType, Prisma } from "#prisma/client";
import type { CollectionMediaCreateManyInput } from "#prisma/models";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				overview: ServerMovieValidation.overview,
				rating: ServerMediaValidation.rating,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const movie = await prisma.movie.create({
				data: {
					media: {
						create: {
							name: input.name,
							type: MediaType.MOVIE,
							ownerId: ctx.user.id,
							rating: input.rating,
						},
					},
					overview: input.overview,
				},
				include: {
					media: true,
				},
			});

			return movie;
		}),

	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalId: ServerMediaValidation.externalId,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const movieExist = await prisma.movie.findFirst({
				where: {
					ownerId: ctx.user.id,
					media: {
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
				},
			});

			if (!existingMovie) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This movie doesn't exist",
				});
			}

			const movie = await prisma.movie.update({
				where: {
					id: input.id,
					media: {
						ownerId: ctx.user.id,
					},
				},
				data: {
					media: {
						update: {
							name: input.name ?? Prisma.skip,
							rating: input.rating === undefined ? Prisma.skip : input.rating,
						},
					},
					overview: input.overview === undefined ? Prisma.skip : input.overview,
				},
				include: {
					media: true,
				},
			});

			return movie;
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const movieExist = await prisma.movie.findFirst({
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

			if (!movieExist) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This movie doesn't exist",
				});
			}

			// Use the media model to leverage the cascade on delete feature
			await prisma.media.deleteMany({
				where: {
					ownerId: ctx.user.id,
					movie: {
						id: input.id,
					},
				},
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			const count = await prisma.movie.count({
				where: {
					media: {
						ownerId: ctx.user.id,
					},
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
		.output(PaginatedSchema(MovieWithMediaViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;

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
					orderBy: [{ media: { name: "asc" } }, { media: { createdAt: "asc" } }],
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
					include: {
						media: true,
					},
				}),
			]);

			return { total, results };
		}),

	getByExternalId: protectedProcedure
		.input(
			z.object({
				externalId: ServerTmdbMovieValidation.id,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await prisma.movie.findFirst({
					where: {
						media: {
							externalId: input.externalId,
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
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movie by external ID",
				});
			}
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
			}),
		)
		.output(MovieWithMediaViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await prisma.movie.findFirst({
					where: {
						id: input.id,
						ownerId: ctx.user.id,
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
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movie by external ID",
				});
			}
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
					ownerId: ctx.user.id,
				},
				select: {
					id: true,
				},
			});

			if (!movie) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "This movie doesn't exist",
				});
			}

			if (input.collectionIds.length > 0) {
				const ownedCollections = await prisma.collection.findMany({
					where: {
						id: { in: input.collectionIds },
						ownerId: ctx.user.id,
					},
					select: { id: true },
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
					await tx.collectionMedia.createMany({
						data: input.collectionIds.map(
							(collectionId) =>
								({
									mediaId: input.id,
									collectionId,
								}) as CollectionMediaCreateManyInput,
						),
					});
				}
			});
		}),
});
