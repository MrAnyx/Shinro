import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { protectedProcedure, router, serieEnabledMiddleware } from "#server/trpc/init";

const episodeParents = {
	media: true,
	season: { include: { media: true, serie: { include: { media: true } } } },
} as const;
const seasonOrEpisodeNumberSchema = SeasonNumberSchemaBase;
// Require ownership of the entire hierarchy, not just the episode's media.
const ownedEpisodes = (userId: string): Prisma.EpisodeWhereInput => ({
	media: { ownerId: userId },
	season: { media: { ownerId: userId }, serie: { media: { ownerId: userId } } },
});

const externalInput = z.object({
	externalSerieId: ServerTmdbSerieValidation.id,
	seasonNumber: seasonOrEpisodeNumberSchema,
	episodeNumber: seasonOrEpisodeNumberSchema,
});

async function fetchExternalEpisodeData(input: z.infer<typeof externalInput>) {
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

const toEpisodeDetails = (episode: Awaited<ReturnType<typeof fetchExternalEpisodeData>>["episode"]) => ({
	number: episode.episode_number,
	name: episode.name,
	overview: episode.overview,
	imagePath: episode.still_path,
	airDate: episode.air_date,
	voteAverage: episode.vote_average,
	runtime: episode.runtime,
});

export default router({
	/** Count episodes only when the episode and both parents belong to the user. */
	count: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.void())
		.output(z.number())
		.query(({ ctx }) => prisma.episode.count({ where: ownedEpisodes(ctx.user.id) })),

	/** List owned episodes with their parents, using a stable order for pagination. */
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
					include: episodeParents,
					orderBy: [{ media: { name: "asc" } }, { id: "asc" }],
					skip: (input.page - 1) * ITEMS_PER_PAGE,
					take: ITEMS_PER_PAGE,
				}),
			]);
			return { total, results };
		}),

	/** Resolve a saved episode by ID or hierarchy; imported episodes also load TMDB metadata. */
	getInternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.union([
				z.object({ id: ServerMediaValidation.id }),
				z.object({
					serieId: ServerSerieValidation.id,
					seasonNumber: seasonOrEpisodeNumberSchema,
					episodeNumber: seasonOrEpisodeNumberSchema,
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
				include: episodeParents,
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
				const data = await fetchExternalEpisodeData({
					externalSerieId,
					seasonNumber: episode.season.number,
					episodeNumber: episode.number,
				});
				details = toEpisodeDetails(data.episode);
			}
			return {
				episode,
				details,
				seasonName: episode.season.media.name,
				serieName: episode.season.serie.media.name,
			};
		}),

	/** Return TMDB details and the user's saved episode, if one exists. */
	getExternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(externalInput)
		.output(EpisodeDetailsSchema)
		.query(async ({ input, ctx }) => {
			const [data, episode] = await Promise.all([
				fetchExternalEpisodeData(input),
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
					include: episodeParents,
				}),
			]);
			return {
				episode,
				details: toEpisodeDetails(data.episode),
				seasonName: data.season.name,
				serieName: data.serie.name,
			};
		}),

	/** Save a TMDB episode and create missing parents in the same transaction. */
	createFromExternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(externalInput)
		.output(EpisodeWithParentsSchema)
		.mutation(async ({ input, ctx }) => {
			const data = await fetchExternalEpisodeData(input);
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
							include: episodeParents,
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

	/**
	 * Update saved fields and optional collection membership atomically.
	 * Imported episodes keep their TMDB season and number; internal episodes may move to an owned internal season.
	 */
	update: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				id: ServerMediaValidation.id,
				seasonId: ServerSeasonValidation.id.optional(),
				number: seasonOrEpisodeNumberSchema.optional(),
				name: ServerMediaValidation.name.optional(),
				overview: ServerSerieValidation.overview.nullable().optional(),
				note: ServerMediaValidation.note.nullable().optional(),
				status: ServerMediaValidation.status.nullable().optional(),
				rating: ServerMediaValidation.rating.nullable().optional(),
				collectionIds: z.array(ServerCollectionValidation.id).optional(),
			}),
		)
		.output(EpisodeWithParentsSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await prisma.$transaction(async (tx) => {
					const episode = await tx.episode.findFirst({
						where: { id: input.id, ...ownedEpisodes(ctx.user.id) },
						select: { id: true, seasonId: true, number: true, media: { select: { source: true } } },
					});
					if (!episode) {
						throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });
					}
					const changesSeason = input.seasonId !== undefined && input.seasonId !== episode.seasonId;
					const changesNumber = input.number !== undefined && input.number !== episode.number;
					if (episode.media.source === SourceType.EXTERNAL && (changesSeason || changesNumber)) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "The season and number of an external episode can not be changed",
						});
					}
					if (input.seasonId !== undefined && episode.media.source === SourceType.INTERNAL) {
						const season = await tx.season.findFirst({
							where: {
								id: input.seasonId,
								media: { ownerId: ctx.user.id, source: SourceType.INTERNAL },
								serie: { media: { ownerId: ctx.user.id } },
							},
							select: { id: true },
						});
						if (!season) {
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "An episode can only belong to one of your internal seasons",
							});
						}
					}
					// Omitted collections leave membership untouched; an empty array clears it.
					if (input.collectionIds !== undefined) {
						const ownedCollections = await tx.collection.findMany({
							where: { id: { in: input.collectionIds }, ownerId: ctx.user.id },
							select: { id: true },
						});
						if (ownedCollections.length !== input.collectionIds.length) {
							throw new TRPCError({
								code: "FORBIDDEN",
								message: "One or more selected collections are invalid",
							});
						}
						await tx.collectionMedia.deleteMany({ where: { mediaId: episode.id } });
						if (input.collectionIds.length) {
							await tx.collectionMedia.createMany({
								data: input.collectionIds.map((collectionId) => ({
									mediaId: episode.id,
									collectionId,
								})),
							});
						}
					}
					// Preserve omitted values, while allowing nullable fields to be cleared.
					return tx.episode.update({
						where: { id: episode.id, media: { ownerId: ctx.user.id } },
						data: {
							...(input.seasonId !== undefined ? { season: { connect: { id: input.seasonId } } } : {}),
							number: input.number ?? Prisma.skip,
							overview: input.overview === undefined ? Prisma.skip : input.overview,
							media: {
								update: {
									name: input.name === undefined ? Prisma.skip : input.name,
									note: input.note === undefined ? Prisma.skip : input.note,
									status: input.status === undefined ? Prisma.skip : input.status,
									rating: input.rating === undefined ? Prisma.skip : input.rating,
								},
							},
						},
						include: episodeParents,
					});
				});
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This season already has an episode with this number",
						cause: error,
					});
				}
				throw error;
			}
		}),

	/** Delete the owned episode's media, cascading to the episode and collection links. */
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
