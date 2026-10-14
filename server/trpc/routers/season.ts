import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	createFromInternal: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				status: ServerMediaValidation.status,
				rating: ServerMediaValidation.rating,
				note: ServerMediaValidation.note,
				overview: ServerSeasonValidation.overview,
				number: ServerSeasonValidation.number,
				serieId: ServerSerieValidation.id,
			}),
		)
		.output(SeasonSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.$transaction(async (tx) => {
				const serie = await tx.serie.findFirst({
					where: {
						id: input.serieId,
						media: {
							ownerId: ctx.user.id,
						},
					},
					select: {
						id: true,
						source: true,
					},
				});

				if (!serie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				if (serie.source === SourceType.EXTERNAL) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You cannot add a season to an external serie",
					});
				}

				const existingSeason = await tx.season.findFirst({
					where: {
						serieId: input.serieId,
						number: input.number,
					},
					select: {
						id: true,
					},
				});

				if (existingSeason) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This season has already been added",
					});
				}

				return await tx.season.create({
					data: {
						media: {
							create: {
								name: input.name,
								source: SourceType.INTERNAL,
								type: MediaType.SEASON,
								status: input.status,
								ownerId: ctx.user.id,
								rating: input.rating,
								note: input.note,
							},
						},
						serie: {
							connect: {
								id: input.serieId,
							},
						},
						number: input.number,
						overview: input.overview,
					},
					include: {
						media: true,
					},
				});
			});
		}),

	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalSerieId: ServerTmdbSerieValidation.id,
				seasonNumber: ServerTmdbSeasonValidation.number,
			}),
		)
		.output(SeasonSchema)
		.mutation(async ({ input, ctx }) => {
			const tmdbSeason = await useCache(
				`tmdb:season:${input.externalSerieId}:${input.seasonNumber}:details`,
				() =>
					tmdb(`/tv/${input.externalSerieId}/season/${input.seasonNumber}`, {
						schema: TmdbSeasonDetailsResponseSchema,
					}),
			);

			return await prisma.$transaction(async (tx) => {
				const serie = await tx.serie.findFirst({
					where: {
						media: {
							ownerId: ctx.user.id,
							externalId: input.externalSerieId,
						},
					},
					select: {
						id: true,
					},
				});

				if (!serie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				const existingSeason = await tx.season.findFirst({
					where: {
						serieId: serie.id,
						number: input.seasonNumber,
					},
					select: {
						id: true,
					},
				});

				if (existingSeason) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This season has already been added",
					});
				}

				return await tx.season.create({
					data: {
						media: {
							create: {
								externalId: tmdbSeason.id,
								name: tmdbSeason.name ?? null,
								type: MediaType.SEASON,
								ownerId: ctx.user.id,
								imagePath: tmdbSeason.poster_path ?? null,
								imageType: ImageType.TMDB,
								source: SourceType.EXTERNAL,
							},
						},
						serie: {
							connect: {
								id: serie.id,
							},
						},
						number: tmdbSeason.season_number,
						overview: tmdbSeason.overview ?? null,
					},
					include: {
						media: true,
					},
				});
			});
		}),

	// update: protectedProcedure
	// 	.input(
	// 		z.object({
	// 			id: ServerSerieValidation.id,
	// 			name: ServerMediaValidation.name.optional(),
	// 			overview: ServerSerieValidation.overview.optional(),
	// 			status: ServerMediaValidation.status.optional(),
	// 			rating: ServerMediaValidation.rating.optional(),
	// 			note: ServerMediaValidation.note.optional(),
	// 		}),
	// 	)
	// 	.output(SerieSchema)
	// 	.mutation(async ({ input, ctx }) => {
	// 		const existingSerie = await prisma.serie.findFirst({
	// 			where: {
	// 				id: input.id,
	// 				media: {
	// 					ownerId: ctx.user.id,
	// 				},
	// 			},
	// 			select: {
	// 				id: true,
	// 				media: {
	// 					select: {
	// 						ownerId: true,
	// 					},
	// 				},
	// 			},
	// 		});

	// 		if (!existingSerie) {
	// 			throw new TRPCError({
	// 				code: "NOT_FOUND",
	// 				message: "Serie not found",
	// 			});
	// 		}

	// 		const {
	// 			name = Prisma.skip,
	// 			rating = Prisma.skip,
	// 			overview = Prisma.skip,
	// 			note = Prisma.skip,
	// 			status = Prisma.skip,
	// 		} = input;

	// 		return await prisma.serie.update({
	// 			where: {
	// 				id: input.id,
	// 				media: {
	// 					ownerId: ctx.user.id,
	// 				},
	// 			},
	// 			data: {
	// 				media: {
	// 					update: {
	// 						name,
	// 						rating,
	// 						note,
	// 						status,
	// 					},
	// 				},
	// 				overview,
	// 			},
	// 			include: {
	// 				media: true,
	// 			},
	// 		});
	// // 	}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerSeasonValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(async (tx) => {
				const existingSeason = await tx.season.findFirst({
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

				if (!existingSeason) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Season not found",
					});
				}

				// Use the media model to leverage the cascade on delete feature
				await tx.media.deleteMany({
					where: {
						ownerId: ctx.user.id,
						id: input.id,
					},
				});
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await prisma.season.count({
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
				source: ServerMediaValidation.source.optional(),
				orderBy: SortableSchema(ServerSeasonValidation.sort),
			}),
		)
		.output(PaginatedSchema(SeasonWithSerieSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy = buildPrismaOrderBy<Prisma.SeasonOrderByWithRelationInput>(input.orderBy);

			const where: Prisma.SeasonWhereInput = {
				media: {
					ownerId: ctx.user.id,
					...(input.source ? { source: input.source } : {}),
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
				prisma.season.count({ where }),
				prisma.season.findMany({
					where,
					orderBy,
					...(input.force ? {} : { skip, take: ITEMS_PER_PAGE }),
					include: {
						media: true,
						serie: {
							include: {
								media: true,
							},
						},
					},
				}),
			]);

			return { total, results };
		}),

	getById: protectedProcedure
		.input(
			z.discriminatedUnion("type", [
				z.object({
					type: z.literal("id"),
					id: ServerSeasonValidation.id,
				}),
				z.object({
					type: z.literal("serieId"),
					serieId: ServerSerieValidation.id,
					seasonNumber: ServerSeasonValidation.number,
				}),
				z.object({
					type: z.literal("externalSerieId"),
					externalSerieId: ServerTmdbSerieValidation.id,
					seasonNumber: ServerSeasonValidation.number,
				}),
			]),
		)
		.output(SeasonWithSerieSchema)
		.query(async ({ input, ctx }) => {
			let seasonFilter: Prisma.SeasonWhereInput;

			if (input.type === "id") {
				seasonFilter = { id: input.id };
			} else if (input.type === "serieId") {
				seasonFilter = { serieId: input.serieId, number: input.seasonNumber };
			} else if (input.type === "externalSerieId") {
				seasonFilter = { media: { externalId: input.externalSerieId }, number: input.seasonNumber };
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid input type",
				});
			}

			const season = await prisma.season.findFirst({
				where: {
					...seasonFilter,
					media: {
						ownerId: ctx.user.id,
					},
				},
				include: {
					media: true,
					serie: {
						include: {
							media: true,
						},
					},
				},
			});

			if (!season) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Season not found",
				});
			}

			return season;
		}),
});
