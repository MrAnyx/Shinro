import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { router, protectedProcedure, serieEnabledMiddleware } from "#server/trpc/init";

export default router({
	createFromInternal: protectedProcedure
		.use(serieEnabledMiddleware)
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
		.mutation(async ({ input, ctx }) =>
			prisma.serie.create({
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
				include: { media: true },
			}),
		),

	createFromExternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ externalSerieId: ServerTmdbSerieValidation.id }))
		.output(SerieSchema)
		.mutation(async ({ input, ctx }) => {
			const details = await tmdb(`/tv/${input.externalSerieId}`, { schema: TmdbSerieDetailsResponseSchema });
			try {
				return await prisma.serie.create({
					data: {
						media: {
							create: {
								externalId: details.id,
								name: details.name ?? null,
								type: MediaType.SERIE,
								ownerId: ctx.user.id,
								imagePath: details.poster_path ?? null,
								imageType: ImageType.TMDB,
								source: SourceType.EXTERNAL,
							},
						},
						overview: details.overview ?? null,
					},
					include: { media: true },
				});
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This series has already been added",
						cause: error,
					});
				}
				throw error;
			}
		}),

	update: protectedProcedure
		.use(serieEnabledMiddleware)
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
			const {
				id,
				name = Prisma.skip,
				overview = Prisma.skip,
				status = Prisma.skip,
				rating = Prisma.skip,
				note = Prisma.skip,
			} = input;
			return prisma.$transaction(async (tx) => {
				const serie = await tx.serie.findFirst({ where: { id, media: { ownerId: ctx.user.id } } });
				if (!serie) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
				}
				return tx.serie.update({
					where: { id, media: { ownerId: ctx.user.id } },
					data: { overview, media: { update: { name, status, rating, note } } },
					include: { media: true },
				});
			});
		}),

	delete: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerSerieValidation.id }))
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(
				async (tx) => {
					const serie = await tx.serie.findFirst({
						where: { id: input.id, media: { ownerId: ctx.user.id } },
						select: {
							seasons: {
								select: {
									id: true,
									media: { select: { ownerId: true } },
									episodes: { select: { id: true, media: { select: { ownerId: true } } } },
								},
							},
						},
					});
					if (!serie) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
					}
					const descendants = serie.seasons.flatMap((season) => [season, ...season.episodes]);
					if (descendants.some((item) => item.media.ownerId !== ctx.user.id)) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "Series contains data owned by another user",
						});
					}
					const episodeIds = serie.seasons.flatMap((season) => season.episodes.map((episode) => episode.id));
					await tx.media.deleteMany({ where: { ownerId: ctx.user.id, id: { in: episodeIds } } });
					await tx.media.deleteMany({
						where: { ownerId: ctx.user.id, id: { in: serie.seasons.map((s) => s.id) } },
					});
					await tx.media.deleteMany({ where: { ownerId: ctx.user.id, id: input.id } });
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		}),

	count: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.void())
		.output(z.number())
		.query(({ ctx }) => prisma.serie.count({ where: { media: { ownerId: ctx.user.id } } })),

	getAll: protectedProcedure
		.use(serieEnabledMiddleware)
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
			const where: Prisma.SerieWhereInput = {
				media: { ownerId: ctx.user.id, ...(input.source ? { source: input.source } : {}) },
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
					orderBy: buildPrismaOrderBy<Prisma.SerieOrderByWithRelationInput>(input.orderBy),
					...(input.force ? {} : { skip: (input.page - 1) * ITEMS_PER_PAGE, take: ITEMS_PER_PAGE }),
					include: { media: true },
				}),
			]);
			return { total, results };
		}),

	getById: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.discriminatedUnion("type", [
				z.object({ type: z.literal("id"), id: ServerSerieValidation.id }),
				z.object({ type: z.literal("externalSerieId"), externalSerieId: ServerTmdbSerieValidation.id }),
			]),
		)
		.output(SerieSchema)
		.query(async ({ input, ctx }) => {
			const serie = await prisma.serie.findFirst({
				where: {
					...(input.type === "id" ? { id: input.id } : { media: { externalId: input.externalSerieId } }),
					AND: [{ media: { ownerId: ctx.user.id } }],
				},
				include: { media: true },
			});
			if (!serie) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
			}
			return serie;
		}),

	getInternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerSerieValidation.id }))
		.output(SerieDetailsSchema)
		.query(async ({ input, ctx }) => {
			const serie = await prisma.serie.findFirst({
				where: { id: input.id, media: { ownerId: ctx.user.id } },
				include: { media: true },
			});
			if (!serie) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Series not found" });
			}
			const collections = await prisma.collectionMedia.findMany({
				where: { mediaId: serie.id, collection: { ownerId: ctx.user.id } },
				select: { collection: true },
			});
			return { serie, details: null, credits: [], collections: collections.map((item) => item.collection) };
		}),

	getExternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ externalSerieId: ServerTmdbSerieValidation.id }))
		.output(SerieDetailsSchema)
		.query(async ({ input, ctx }) => {
			const id = input.externalSerieId;
			const [response, creditsResponse, serie] = await Promise.all([
				useCache(`tmdb:serie:${id}:details`, () =>
					tmdb(`/tv/${id}`, { schema: TmdbSerieDetailsResponseSchema }),
				),
				useCache(`tmdb:serie:${id}:credits`, () =>
					tmdb(`/tv/${id}/credits`, { schema: TmdbSerieCreditsResponseSchema }),
				),
				prisma.serie.findFirst({
					where: { media: { ownerId: ctx.user.id, externalId: id } },
					include: { media: true },
				}),
			]);
			const collections = serie
				? await prisma.collectionMedia.findMany({
						where: { mediaId: serie.id, collection: { ownerId: ctx.user.id } },
						select: { collection: true },
					})
				: [];
			return {
				serie,
				details: {
					...response,
					genres: response.genres?.flatMap((genre) => (genre?.name?.trim() ? [genre.name.trim()] : [])) ?? [],
				},
				credits: creditsResponse.cast?.filter((item) => !!item) ?? [],
				collections: collections.map((item) => item.collection),
			};
		}),
});
