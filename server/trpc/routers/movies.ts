import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { Prisma } from "~~/server/prisma/generated/client";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				title: ServerMovieValidation.title,
				description: ServerMovieValidation.description,
			}),
		)
		.output(MovieDefaultViewSchema)
		.mutation(async ({ input, ctx }) => {
			const movie = await prisma.movie.create({
				data: {
					title: input.title,
					description: input.description,
					ownerId: ctx.user.id,
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
				title: ServerMovieValidation.title,
				description: ServerMovieValidation.description,
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
					title: input.title,
					description: input.description,
				},
			});

			return movie;
		}),

	updateRating: protectedProcedure
		.input(
			z.object({
				id: ServerMovieValidation.id,
				rating: ServerMovieValidation.rating,
			}),
		)
		.output(z.void())
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

			await prisma.movie.update({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
				},
				data: {
					rating: input.rating,
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
		.output(MovieDefaultViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await prisma.movie.findFirst({
					where: {
						externalId: input.externalId,
						ownerId: ctx.user.id,
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
});
