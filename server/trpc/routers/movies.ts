import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { Prisma } from "#server/prisma/generated/client";
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
			const tmdbMovie = await tmdb(`/movie/${input.externalId}`);

			const movieExist = await prisma.movie.findUnique({
				where: {
					externalId: input.externalId,
					id: Prisma.skip,
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
});
