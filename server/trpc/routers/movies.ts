import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	createFromExternal: protectedProcedure
		.input(MovieCreateFromExternalInputSchema)
		.output(MovieCreateFromExternalOutputSchema)
		.mutation(async ({ input, ctx }) => {
			const tmdbMovie = await tmdb<TMDbMovieDetails>(`/movie/${input.externalId}`);

			const movieExist = await prisma.movie.findUnique({
				where: {
					externalId: input.externalId,
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
