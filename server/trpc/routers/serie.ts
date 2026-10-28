import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	createFromInternal: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				overview: ServerSerieValidation.overview,
				status: ServerMediaValidation.status,
				rating: ServerMediaValidation.rating,
				note: ServerMediaValidation.note,
			}),
		)
		.output(SerieSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.serie.create({
				data: {
					media: {
						create: {
							name: input.name,
							source: SourceType.INTERNAL,
							type: MediaType.SERIE,
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

	createFromExternal: protectedProcedure
		.input(
			z.object({
				externalSerieId: ServerTmdbSerieValidation.id,
			}),
		)
		.output(SerieSchema)
		.mutation(async ({ input, ctx }) => {
			const tmdbSerie = await tmdb(`/tv/${input.externalSerieId}`, {
				schema: TmdbSerieDetailsResponseSchema,
			});

			return await prisma.$transaction(async (tx) => {
				const serieExist = await SerieRepository.findByExternalId({
					externalId: input.externalSerieId,
					ownerId: ctx.user.id,
					db: tx,
				});

				if (serieExist) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This serie as already been added",
					});
				}

				const movie = await tx.serie.create({
					data: {
						media: {
							create: {
								externalId: tmdbSerie.id,
								name: tmdbSerie.name ?? null,
								type: MediaType.SERIE,
								ownerId: ctx.user.id,
								source: SourceType.EXTERNAL,
								imagePath: tmdbSerie.poster_path ?? null,
								imageType: ImageType.TMDB,
							},
						},
						overview: tmdbSerie.overview ?? null,
					},
					include: {
						media: true,
					},
				});

				return movie;
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerSerieValidation.id,
				name: ServerMediaValidation.name.optional(),
				overview: ServerSerieValidation.overview.optional(),
				status: ServerMediaValidation.status.optional(),
				rating: ServerMediaValidation.rating.optional(),
				note: ServerMediaValidation.note.optional(),
			}),
		)
		.output(SerieSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.$transaction(async (tx) => {
				const existingSerie = await SerieRepository.findOwned({ id: input.id, ownerId: ctx.user.id, db: tx });

				if (!existingSerie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				const {
					name = Prisma.skip,
					rating = Prisma.skip,
					overview = Prisma.skip,
					note = Prisma.skip,
					status = Prisma.skip,
				} = input;

				return await tx.serie.update({
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
			});
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerSerieValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(async (tx) => {
				const existingSerie = await SerieRepository.findOwned({ id: input.id, ownerId: ctx.user.id, db: tx });

				if (!existingSerie) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Serie not found",
					});
				}

				// Use the media model to leverage the cascade on delete feature
				await MediaRepository.deleteOwned({ id: input.id, ownerId: ctx.user.id, db: tx });
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await SerieRepository.countByOwner({ ownerId: ctx.user.id });
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search,
				force: ServerPaginationValidation.force,
				source: ServerMediaValidation.source.optional(),
				orderBy: SortableSchema(ServerSerieValidation.sort),
			}),
		)
		.output(PaginatedSchema(SerieSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy = buildPrismaOrderBy<Prisma.SerieOrderByWithRelationInput>(input.orderBy);

			const where: Prisma.SerieWhereInput = {
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
				prisma.serie.count({ where }),
				prisma.serie.findMany({
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

	getById: protectedProcedure
		.input(
			z.discriminatedUnion("type", [
				z.object({
					type: z.literal("id"),
					id: ServerSerieValidation.id,
				}),
				z.object({
					type: z.literal("externalSerieId"),
					externalSerieId: ServerTmdbSerieValidation.id,
				}),
			]),
		)
		.output(SerieSchema)
		.query(async ({ input, ctx }) => {
			let serieFilter: Prisma.SerieWhereInput;

			if (input.type === "id") {
				serieFilter = { id: input.id };
			} else if (input.type === "externalSerieId") {
				serieFilter = { media: { externalId: input.externalSerieId } };
			} else {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid input type",
				});
			}

			const serie = await prisma.serie.findFirst({
				where: {
					...serieFilter,
					media: {
						ownerId: ctx.user.id,
					},
				},
				include: {
					media: true,
				},
			});

			if (!serie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Serie not found",
				});
			}

			return serie;
		}),
});
