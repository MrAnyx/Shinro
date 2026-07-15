import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { Prisma } from "~~/server/prisma/generated/client";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalId: MovieValidation.externalId,
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
					externalId: input.externalId,
					title: tmdbMovie.title,
					description: tmdbMovie.overview,
					ownerId: ctx.user.id,
					posterPath: tmdbMovie.poster_path,
				},
			});

			return movie;
		}),
	delete: protectedProcedure
		.input(
			z.object({
				id: MovieValidation.id,
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
				page: PaginationValidation.page,
				search: PaginationValidation.search,
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
});
