import { TRPCError } from "@trpc/server";
import * as z from "zod";

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
});
