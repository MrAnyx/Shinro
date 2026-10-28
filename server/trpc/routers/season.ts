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
		.output(SeasonWithSerieSchema)
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
						media: {
							select: {
								source: true,
							},
						},
					},
				});

				if (!serie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				if (serie.media.source === SourceType.EXTERNAL) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "You cannot add an internal season to an external serie",
					});
				}

				const existingSeason = await SeasonRepository.findBySerieAndNumber(tx, input.serieId, input.number);

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
						serie: {
							include: {
								media: true,
							},
						},
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
						media: {
							select: {
								source: true,
							},
						},
					},
				});

				if (!serie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				if (serie.media.source === SourceType.INTERNAL) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "You cannot add an external season to an internal serie",
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
						serie: {
							include: {
								media: true,
							},
						},
					},
				});
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerSeasonValidation.id,
				name: ServerMediaValidation.name.optional(),
				overview: ServerSeasonValidation.overview.optional(),
				status: ServerMediaValidation.status.optional(),
				rating: ServerMediaValidation.rating.optional(),
				note: ServerMediaValidation.note.optional(),
				number: ServerSeasonValidation.number.optional(),
				serieId: ServerSerieValidation.id.optional(),
			}),
		)
		.output(SeasonWithSerieSchema)
		.mutation(async ({ input, ctx }) => {
			const INTERNAL_ONLY_FIELDS = ["number", "serieId"] satisfies (keyof typeof input)[];

			return await prisma.$transaction(async (tx) => {
				const existingSeason = await SeasonRepository.findOwned(tx, input.id, ctx.user.id);

				if (!existingSeason) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Season not found",
					});
				}

				log.debug(input);

				if (
					existingSeason.media.source === SourceType.EXTERNAL &&
					INTERNAL_ONLY_FIELDS.some((field) => input[field] !== undefined)
				) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Some fields cannot be modified on an external season",
					});
				}

				if (input.serieId) {
					const serie = await tx.serie.findFirst({
						where: {
							id: input.serieId,
							media: {
								ownerId: ctx.user.id,
							},
						},
						select: {
							id: true,
							media: {
								select: {
									source: true,
								},
							},
						},
					});

					if (!serie) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Serie not found",
						});
					}

					if (serie.media.source === SourceType.EXTERNAL) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "You cannot add an internal season to an external serie",
						});
					}
				}

				const {
					name = Prisma.skip,
					rating = Prisma.skip,
					overview = Prisma.skip,
					note = Prisma.skip,
					status = Prisma.skip,
					number = Prisma.skip,
					serieId,
				} = input;

				return await tx.season.update({
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
						...(serieId ? { serie: { connect: { id: serieId } } } : {}),
						number,
						overview,
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
			});
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerSeasonValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(async (tx) => {
				const existingSeason = await SeasonRepository.findOwned(tx, input.id, ctx.user.id);

				if (!existingSeason) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Season not found",
					});
				}

				// Use the media model to leverage the cascade on delete feature
				await MediaRepository.deleteOwned(tx, input.id, ctx.user.id);
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await SeasonRepository.countByOwner(prisma, ctx.user.id);
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
				seasonFilter = { number: input.seasonNumber, serie: { media: { id: input.serieId } } };
			} else if (input.type === "externalSerieId") {
				seasonFilter = { number: input.seasonNumber, serie: { media: { externalId: input.externalSerieId } } };
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
