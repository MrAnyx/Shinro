import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { Prisma } from "~~/server/prisma/generated/client";

import { router, protectedProcedure } from "#server/trpc/init";
import { ServerCollectionValidation } from "#server/utils/collection.validations";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				title: ServerMovieValidation.title,
				description: ServerMovieValidation.description,
				rating: ServerMovieValidation.rating,
			}),
		)
		.output(MovieDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const movie = await prisma.movie.create({
				data: {
					title: input.title,
					description: input.description,
					ownerId: ctx.user.id,
					rating: input.rating,
				},
			});

			return movie;
		}),

	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalId: ServerMovieValidation.externalId,
			}),
		)
		.output(MovieDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const tmdbMovie = await tmdb(`/movie/${input.externalId}`, {
				schema: TmdbMovieDetailsResponseSchema,
			});

			const movieExist = await prisma.movie.findFirst({
				where: {
					externalId: input.externalId,
					ownerId: ctx.user.id,
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

			const movie = await prisma.movie.create({
				data: {
					externalId: tmdbMovie.id,
					title: tmdbMovie.title ?? null,
					description: tmdbMovie.overview ?? null,
					ownerId: ctx.user.id,
					posterPath: tmdbMovie.poster_path ?? null,
				},
			});

			return movie;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
				title: ServerMovieValidation.title.optional(),
				description: ServerMovieValidation.description.optional(),
				rating: ServerMovieValidation.rating.optional(),
			}),
		)
		.output(MovieDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const existingMovie = await prisma.movie.findFirst({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
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
					ownerId: ctx.user.id,
				},
				data: {
					title: input.title ?? Prisma.skip,
					description: input.description === undefined ? Prisma.skip : input.description,
					rating: input.rating === undefined ? Prisma.skip : input.rating,
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
					ownerId: ctx.user.id,
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

			await prisma.movie.deleteMany({
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
			const count = await prisma.movie.count({
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
			}),
		)
		.output(PaginatedSchema(MovieDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;

			const where: Prisma.MovieWhereInput = {
				ownerId: ctx.user.id,
				...(input.search
					? {
							OR: [
								{ title: { contains: input.search, mode: "insensitive" } },
								{ description: { contains: input.search, mode: "insensitive" } },
							],
						}
					: {}),
			};

			const [total, results] = await Promise.all([
				prisma.movie.count({ where }),
				prisma.movie.findMany({
					where,
					orderBy: [{ title: "asc" }, { createdAt: "asc" }],
					skip,
					take: ITEMS_PER_PAGE,
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
		.output(MovieWithCollectionsViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await prisma.movie.findFirst({
					where: {
						externalId: input.externalId,
						ownerId: ctx.user.id,
					},
					include: {
						collectionMovies: {
							include: {
								collection: true,
							},
						},
					},
				});

				if (!movie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Movie not found",
					});
				}

				return {
					...movie,
					collections: movie.collectionMovies.map((x) => x.collection),
				};
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
		.output(MovieWithCollectionsViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await prisma.movie.findFirst({
					where: {
						id: input.id,
						ownerId: ctx.user.id,
					},
					include: {
						collectionMovies: {
							include: {
								collection: true,
							},
						},
					},
				});

				if (!movie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Movie not found",
					});
				}

				return {
					...movie,
					collections: movie.collectionMovies.map((x) => x.collection),
				};
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
				await tx.collectionMovie.deleteMany({
					where: { movieId: input.id },
				});

				if (input.collectionIds.length > 0) {
					await tx.collectionMovie.createMany({
						data: input.collectionIds.map((collectionId) => ({
							movieId: input.id,
							collectionId,
						})),
					});
				}
			});
		}),
});
