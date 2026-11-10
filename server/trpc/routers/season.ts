import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { router, protectedProcedure, serieEnabledMiddleware } from "#server/trpc/init";

export default router({
	count: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.void())
		.output(z.number())
		.query(({ ctx }) => prisma.season.count({ where: { media: { ownerId: ctx.user.id } } })),

	createFromExternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				externalSerieId: ServerTmdbSerieValidation.id,
				seasonNumber: z.number().int().min(0).max(2147483647),
			}),
		)
		.output(z.object({ season: SeasonSchema, serie: SerieSchema, createdSerie: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			const details = await useCache(`tmdb:serie:${input.externalSerieId}:details:v2`, () =>
				tmdb(`/tv/${input.externalSerieId}`, { schema: TmdbSerieDetailsResponseSchema }),
			);
			const externalSeason = details.seasons?.find((season) => season?.season_number === input.seasonNumber);
			if (!externalSeason) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}

			try {
				return await prisma.$transaction(
					async (tx) => {
						let serie = await tx.serie.findFirst({
							where: { media: { ownerId: ctx.user.id, externalId: input.externalSerieId } },
							include: { media: true },
						});
						const createdSerie = !serie;
						if (!serie) {
							serie = await tx.serie.create({
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
						}
						const season = await tx.season.create({
							data: {
								serie: { connect: { id: serie.id } },
								number: externalSeason.season_number,
								overview: externalSeason.overview ?? null,
								media: {
									create: {
										externalId: externalSeason.id,
										name: externalSeason.name ?? null,
										type: MediaType.SEASON,
										ownerId: ctx.user.id,
										imagePath: externalSeason.poster_path ?? null,
										imageType: ImageType.TMDB,
										source: SourceType.EXTERNAL,
									},
								},
							},
							include: { media: true },
						});
						return { season, serie, createdSerie };
					},
					{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
				);
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This season or series has already been added",
						cause: error,
					});
				}
				throw error;
			}
		}),

	delete: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: MediaIdSchemaBase }))
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			await prisma.$transaction(
				async (tx) => {
					const season = await tx.season.findFirst({
						where: {
							id: input.id,
							media: { ownerId: ctx.user.id },
							serie: { media: { ownerId: ctx.user.id } },
						},
						select: { episodes: { select: { id: true, media: { select: { ownerId: true } } } } },
					});
					if (!season) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
					}
					if (season.episodes.some((episode) => episode.media.ownerId !== ctx.user.id)) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "Season contains data owned by another user",
						});
					}
					await tx.media.deleteMany({
						where: { ownerId: ctx.user.id, id: { in: season.episodes.map((episode) => episode.id) } },
					});
					await tx.media.deleteMany({ where: { ownerId: ctx.user.id, id: input.id } });
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
			);
		}),
});
