import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	search: protectedProcedure
		.input(
			z.object({
				search: PaginationValidation.search,
				page: PaginationValidation.page,
			}),
		)
		.output(PaginatedSchema(TmdbMovieSearchDefaultViewSchema))
		.query(async ({ input, ctx }) => {
			try {
				const tmdbMovies = await tmdb("/search/movie", {
					schema: TmdbMovieSearchResponseSchema,
					query: {
						query: input.search,
						page: input.page,
					},
				});

				const externalIds = tmdbMovies.results.map((x) => x.id);

				const myMovies = await prisma.movie.findMany({
					where: {
						ownerId: ctx.user.id,
						externalId: {
							in: externalIds,
						},
					},
					select: {
						id: true,
						externalId: true,
					},
				});

				const myMoviesMap = new Map(myMovies.map((m) => [m.externalId, m.id]));

				const movies = tmdbMovies.results.map((movie) => ({
					...movie,
					internalId: myMoviesMap.get(movie.id) ?? null,
				}));

				return {
					total: tmdbMovies.total_results,
					results: movies,
				};
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movies",
				});
			}
		}),

	details: protectedProcedure
		.input(
			z.object({
				id: TmdbMovieValidation.id,
			}),
		)
		.output(TmdbMovieDetailsDefaultViewSchema)
		.query(async ({ input, ctx }) => {
			try {
				const movie = await tmdb(`/movie/${input.id}`, {
					schema: TmdbMovieDetailsResponseSchema,
				});

				const myMovie = await prisma.movie.findFirst({
					where: {
						ownerId: ctx.user.id,
						externalId: input.id,
					},
					select: {
						description: true,
						title: true,
					},
				});

				if (myMovie) {
					movie.title = myMovie.title;
					movie.overview = myMovie.description;
				}

				return movie;
			} catch (err: any) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: err,
					message: "An error occured while getting movies",
				});
			}
		}),
});
