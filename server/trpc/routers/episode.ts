import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { protectedProcedure, router, serieEnabledMiddleware } from "#server/trpc/init";

const parents = { media: true, season: { include: { media: true, serie: { include: { media: true } } } } } as const;
const numberSchema = SeasonNumberSchemaBase;
const ownedEpisodes = (userId: string): Prisma.EpisodeWhereInput => ({
	media: { ownerId: userId },
	season: { media: { ownerId: userId }, serie: { media: { ownerId: userId } } },
});

const externalInput = z.object({
	externalSerieId: ServerTmdbSerieValidation.id,
	seasonNumber: numberSchema,
	episodeNumber: numberSchema,
});

async function externalData(input: z.infer<typeof externalInput>) {
	const [serie, seasonDetails] = await Promise.all([
		useCache(`tmdb:serie:${input.externalSerieId}:details:v2`, () =>
			tmdb(`/tv/${input.externalSerieId}`, { schema: TmdbSerieDetailsResponseSchema }),
		),
		useCache(`tmdb:serie:${input.externalSerieId}:season:${input.seasonNumber}:details:v2`, () =>
			tmdb(`/tv/${input.externalSerieId}/season/${input.seasonNumber}`, {
				schema: TmdbSeasonDetailsResponseSchema,
			}),
		),
	]);
	const season = serie.seasons?.find((item) => item?.season_number === input.seasonNumber);
	const episode = seasonDetails.episodes?.find((item) => item?.episode_number === input.episodeNumber);
	if (!season || !episode) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });
	}
	return { serie, season, episode };
}

const toDetails = (episode: Awaited<ReturnType<typeof externalData>>["episode"]) => ({
	number: episode.episode_number,
	name: episode.name,
	overview: episode.overview,
	imagePath: episode.still_path,
	airDate: episode.air_date,
	voteAverage: episode.vote_average,
	runtime: episode.runtime,
});

export default router({
	count: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.void())
		.output(z.number())
		.query(({ ctx }) => prisma.episode.count({ where: ownedEpisodes(ctx.user.id) })),

	getAll: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ page: ServerPaginationValidation.page }))
		.output(PaginatedSchema(EpisodeWithParentsSchema))
		.query(async ({ input, ctx }) => {
			const where = ownedEpisodes(ctx.user.id);
			const [total, results] = await Promise.all([
				prisma.episode.count({ where }),
				prisma.episode.findMany({
					where,
					include: parents,
					orderBy: [{ media: { name: "asc" } }, { id: "asc" }],
					skip: (input.page - 1) * ITEMS_PER_PAGE,
					take: ITEMS_PER_PAGE,
				}),
			]);
			return { total, results };
		}),

	getInternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.union([
				z.object({ id: ServerMediaValidation.id }),
				z.object({
					serieId: ServerSerieValidation.id,
					seasonNumber: numberSchema,
					episodeNumber: numberSchema,
				}),
			]),
		)
		.output(EpisodeDetailsSchema)
		.query(async ({ input, ctx }) => {
			const episode = await prisma.episode.findFirst({
				where: {
					...("id" in input ? { id: input.id } : { number: input.episodeNumber }),
					media: { ownerId: ctx.user.id },
					season: {
						...("id" in input ? {} : { serieId: input.serieId, number: input.seasonNumber }),
						media: { ownerId: ctx.user.id },
						serie: { media: { ownerId: ctx.user.id } },
					},
				},
				include: parents,
			});
			if (!episode) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });
			}
			let details: SeasonEpisode = {
				number: episode.number,
				name: episode.media.name,
				overview: episode.overview,
				imagePath: episode.media.imagePath,
			};
			if (episode.media.source === SourceType.EXTERNAL) {
				const externalSerieId = episode.season.serie.media.externalId;
				if (!externalSerieId) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Episode has no external series ID",
					});
				}
				const data = await externalData({
					externalSerieId,
					seasonNumber: episode.season.number,
					episodeNumber: episode.number,
				});
				details = toDetails(data.episode);
			}
			return {
				episode,
				details,
				seasonName: episode.season.media.name,
				serieName: episode.season.serie.media.name,
			};
		}),

	getExternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(externalInput)
		.output(EpisodeDetailsSchema)
		.query(async ({ input, ctx }) => {
			const [data, episode] = await Promise.all([
				externalData(input),
				prisma.episode.findFirst({
					where: {
						number: input.episodeNumber,
						media: { ownerId: ctx.user.id },
						season: {
							number: input.seasonNumber,
							media: { ownerId: ctx.user.id },
							serie: { media: { ownerId: ctx.user.id, externalId: input.externalSerieId } },
						},
					},
					include: parents,
				}),
			]);
			return {
				episode,
				details: toDetails(data.episode),
				seasonName: data.season.name,
				serieName: data.serie.name,
			};
		}),

	createFromExternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(externalInput)
		.output(EpisodeWithParentsSchema)
		.mutation(async ({ input, ctx }) => {
			const data = await externalData(input);
			try {
				return await prisma.$transaction(
					async (tx) => {
						let serie = await tx.serie.findFirst({
							where: { media: { ownerId: ctx.user.id, externalId: input.externalSerieId } },
							include: { media: true },
						});
						if (!serie) {
							serie = await tx.serie.create({
								data: {
									overview: data.serie.overview ?? null,
									media: {
										create: {
											type: MediaType.SERIE,
											source: SourceType.EXTERNAL,
											ownerId: ctx.user.id,
											externalId: data.serie.id,
											name: data.serie.name ?? null,
											imagePath: data.serie.poster_path ?? null,
											imageType: ImageType.TMDB,
										},
									},
								},
								include: { media: true },
							});
						}
						let season = await tx.season.findFirst({
							where: { serieId: serie.id, number: input.seasonNumber, media: { ownerId: ctx.user.id } },
						});
						if (!season) {
							season = await tx.season.create({
								data: {
									serie: { connect: { id: serie.id } },
									number: input.seasonNumber,
									overview: data.season.overview ?? null,
									media: {
										create: {
											type: MediaType.SEASON,
											source: SourceType.EXTERNAL,
											ownerId: ctx.user.id,
											externalId: data.season.id,
											name: data.season.name ?? null,
											imagePath: data.season.poster_path ?? null,
											imageType: ImageType.TMDB,
										},
									},
								},
							});
						}
						return tx.episode.create({
							data: {
								season: { connect: { id: season.id } },
								number: input.episodeNumber,
								overview: data.episode.overview ?? null,
								media: {
									create: {
										type: MediaType.EPISODE,
										source: SourceType.EXTERNAL,
										ownerId: ctx.user.id,
										externalId: data.episode.id,
										name: data.episode.name ?? null,
										imagePath: data.episode.still_path ?? null,
										imageType: ImageType.TMDB,
									},
								},
							},
							include: parents,
						});
					},
					{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
				);
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This episode or its parent has already been added",
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
				id: ServerMediaValidation.id,
				status: ServerMediaValidation.status.nullable().optional(),
				rating: ServerMediaValidation.rating.nullable().optional(),
			}),
		)
		.output(EpisodeWithParentsSchema)
		.mutation(async ({ input, ctx }) => {
			const episode = await prisma.episode.findFirst({
				where: {
					id: input.id,
					media: { ownerId: ctx.user.id },
					season: { media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
				},
				select: { id: true },
			});
			if (!episode) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });
			}
			return prisma.episode.update({
				where: { id: episode.id, media: { ownerId: ctx.user.id } },
				data: {
					media: {
						update: {
							status: input.status === undefined ? Prisma.skip : input.status,
							rating: input.rating === undefined ? Prisma.skip : input.rating,
						},
					},
				},
				include: parents,
			});
		}),

	delete: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerMediaValidation.id }))
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const result = await prisma.media.deleteMany({
				where: {
					id: input.id,
					ownerId: ctx.user.id,
					episode: {
						season: { media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
					},
				},
			});
			if (!result.count) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });
			}
		}),
});
