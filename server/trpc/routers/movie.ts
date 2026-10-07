import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	/**
	 * Create a new movie for the authenticated user. The movie will be created with a media of type MOVIE.
	 */
	create: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				overview: ServerMovieValidation.overview,
				status: ServerMediaValidation.status,
				rating: ServerMediaValidation.rating,
				note: ServerMediaValidation.note,
			}),
		)
		.output(MovieWithMediaSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.movie.create({
				data: {
					media: {
						create: {
							name: input.name,
							type: MediaType.MOVIE,
							status: input.status,
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

	/**
	 * Create a new movie for the authenticated user from an external source.
	 */
	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalId: ServerTmdbMovieValidation.id,
			}),
		)
		.output(MovieWithMediaSchema)
		.mutation(async ({ input, ctx }) => {
			const tmdbMovie = await tmdb(`/movie/${input.externalId}`, {
				schema: TmdbMovieDetailsResponseSchema,
			});

			return await prisma.$transaction(async (tx) => {
				const movieExist = await tx.movie.findFirst({
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

				const movie = await tx.movie.create({
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
			});
		}),

	/**
	 * Update an existing movie for the authenticated user.
	 */
	update: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
				name: ServerMediaValidation.name.optional(),
				overview: ServerMovieValidation.overview.optional(),
				status: ServerMediaValidation.status.optional(),
				rating: ServerMediaValidation.rating.optional(),
				note: ServerMediaValidation.note.optional(),
			}),
		)
		.output(MovieWithMediaSchema)
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

			const {
				name = Prisma.skip,
				rating = Prisma.skip,
				overview = Prisma.skip,
				note = Prisma.skip,
				status = Prisma.skip,
			} = input;

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
							status,
						},
					},
					overview,
				},
				include: {
					media: true,
				},
			});
		}),

	/**
	 * Delete an existing movie for the authenticated user.
	 */
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

	/**
	 * Count the number of movies for the authenticated user.
	 */
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

	/**
	 * Get all the movies for the authenticated user, with pagination, search and sorting.
	 * If the force flag is set to true, all the movies will be returned without pagination.
	 */
	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				orderBy: SortableSchema(ServerMovieValidation.sort),
			}),
		)
		.output(PaginatedSchema(MovieWithMediaSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy = buildPrismaOrderBy<Prisma.MovieOrderByWithRelationInput>(input.orderBy);

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

	/**
	 * Get a movie by its ID for the authenticated user.
	 */
	getById: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id.optional(),
				externalId: ServerTmdbMovieValidation.id.optional(),
			}),
		)
		.output(MovieWithMediaSchema)
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
});
