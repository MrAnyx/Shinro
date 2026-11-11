import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma, SourceType } from "#prisma/client";
import { router, protectedProcedure, serieEnabledMiddleware } from "#server/trpc/init";

const assertInternalSerie = async (tx: Prisma.TransactionClient, serieId: string, userId: string) => {
	const serie = await tx.serie.findFirst({
		where: { id: serieId, media: { ownerId: userId, source: SourceType.INTERNAL } },
		select: { id: true },
	});
	if (!serie) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "A season can only belong to one of your internal series",
		});
	}
};

const toSeasonConflict = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
		? new TRPCError({
				code: "CONFLICT",
				message: "This series already has a season with this number",
				cause: error,
			})
		: error;

export default router({
	createFromInternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				serieId: ServerSerieValidation.id,
				number: ServerSeasonValidation.number,
				name: ServerMediaValidation.name,
				overview: ServerSerieValidation.overview.nullable(),
				status: ServerMediaValidation.status.nullable(),
				rating: ServerMediaValidation.rating.nullable(),
				note: ServerMediaValidation.note.nullable(),
			}),
		)
		.output(SeasonSchema)
		.mutation(({ input, ctx }) =>
			prisma
				.$transaction(async (tx) => {
					await assertInternalSerie(tx, input.serieId, ctx.user.id);
					return tx.season.create({
						data: {
							serie: { connect: { id: input.serieId } },
							number: input.number,
							overview: input.overview,
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
						},
						include: { media: true },
					});
				})
				.catch((error) => {
					throw toSeasonConflict(error);
				}),
		),

	count: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.void())
		.output(z.number())
		.query(({ ctx }) => prisma.season.count({ where: { media: { ownerId: ctx.user.id } } })),

	getAll: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				page: ServerPaginationValidation.page,
				search: ServerPaginationValidation.search.nullish(),
				force: ServerPaginationValidation.force,
				serieId: ServerSerieValidation.id.optional(),
			}),
		)
		.output(PaginatedSchema(SeasonWithSerieSchema))
		.query(async ({ input, ctx }) => {
			const where: Prisma.SeasonWhereInput = {
				media: { ownerId: ctx.user.id },
				serie: { media: { ownerId: ctx.user.id } },
				...(input.serieId ? { serieId: input.serieId } : {}),
				...(input.search
					? {
							OR: [
								{ media: { name: { contains: input.search, mode: "insensitive" } } },
								{ overview: { contains: input.search, mode: "insensitive" } },
								{ serie: { media: { name: { contains: input.search, mode: "insensitive" } } } },
							],
						}
					: {}),
			};
			const [total, results] = await Promise.all([
				prisma.season.count({ where }),
				prisma.season.findMany({
					where,
					...(input.force ? {} : { skip: (input.page - 1) * ITEMS_PER_PAGE, take: ITEMS_PER_PAGE }),
					orderBy: input.serieId
						? [{ number: "asc" }, { id: "asc" }]
						: [{ media: { name: "asc" } }, { id: "asc" }],
					include: { media: true, serie: { include: { media: true } } },
				}),
			]);
			return { total, results };
		}),

	getById: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerSeasonValidation.id }))
		.output(SeasonWithSerieSchema)
		.query(async ({ input, ctx }) => {
			const season = await prisma.season.findFirst({
				where: { id: input.id, media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
				include: { media: true, serie: { include: { media: true } } },
			});
			if (!season) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			return season;
		}),

	getExternalDetails: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				externalSerieId: ServerTmdbSerieValidation.id,
				seasonNumber: ServerSeasonValidation.number,
			}),
		)
		.output(ExternalSeasonDetailsSchema)
		.query(async ({ input, ctx }) => {
			const [serieResponse, seasonResponse, creditsResponse, internalSeason] = await Promise.all([
				useCache(`tmdb:serie:${input.externalSerieId}:details:v2`, () =>
					tmdb(`/tv/${input.externalSerieId}`, { schema: TmdbSerieDetailsResponseSchema }),
				),
				useCache(`tmdb:serie:${input.externalSerieId}:season:${input.seasonNumber}:details:v2`, () =>
					tmdb(`/tv/${input.externalSerieId}/season/${input.seasonNumber}`, {
						schema: TmdbSeasonDetailsResponseSchema,
					}),
				),
				useCache(`tmdb:serie:${input.externalSerieId}:season:${input.seasonNumber}:credits`, () =>
					tmdb(`/tv/${input.externalSerieId}/season/${input.seasonNumber}/credits`, {
						schema: TmdbSerieCreditsResponseSchema,
					}),
				),
				prisma.season.findFirst({
					where: {
						number: input.seasonNumber,
						media: { ownerId: ctx.user.id },
						serie: { media: { ownerId: ctx.user.id, externalId: input.externalSerieId } },
					},
					include: { media: true, serie: { include: { media: true } } },
				}),
			]);
			const season = serieResponse.seasons?.find((item) => item?.season_number === input.seasonNumber);
			if (!season) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			return {
				serie: {
					...serieResponse,
					genres:
						serieResponse.genres?.flatMap((genre) => (genre?.name?.trim() ? [genre.name.trim()] : [])) ??
						[],
				},
				season,
				episodes:
					seasonResponse.episodes
						?.filter((episode) => !!episode)
						.map((episode) => ({
							number: episode.episode_number,
							name: episode.name,
							overview: episode.overview,
							imagePath: episode.still_path,
							airDate: episode.air_date,
							voteAverage: episode.vote_average,
							runtime: episode.runtime,
						})) ?? [],
				credits: creditsResponse.cast?.filter((credit) => !!credit) ?? [],
				internalSeason,
			};
		}),

	getEpisodes: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerSeasonValidation.id }))
		.output(z.array(SeasonEpisodeSchema))
		.query(async ({ input, ctx }) => {
			const season = await prisma.season.findFirst({
				where: { id: input.id, media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
				include: {
					media: true,
					serie: { include: { media: true } },
					episodes: { where: { media: { ownerId: ctx.user.id } }, include: { media: true } },
				},
			});
			if (!season) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			const saved = new Map(season.episodes.map((episode) => [episode.number, episode]));
			const episodes: SeasonEpisode[] = [];
			if (season.media.source === SourceType.EXTERNAL) {
				const serieId = season.serie.media.externalId;
				if (!serieId) {
					throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Season has no external series ID" });
				}
				const response = await useCache(`tmdb:serie:${serieId}:season:${season.number}:details:v2`, () =>
					tmdb(`/tv/${serieId}/season/${season.number}`, { schema: TmdbSeasonDetailsResponseSchema }),
				);
				for (const episode of response.episodes ?? []) {
					if (!episode) {
						continue;
					}
					const own = saved.get(episode.episode_number);
					episodes.push({
						number: episode.episode_number,
						name: own?.media.name ?? episode.name,
						overview: own?.overview ?? episode.overview,
						imagePath: own?.media.imagePath ?? episode.still_path,
						airDate: episode.air_date,
						voteAverage: episode.vote_average,
						runtime: episode.runtime,
					});
					saved.delete(episode.episode_number);
				}
			}
			for (const episode of saved.values()) {
				episodes.push({
					number: episode.number,
					name: episode.media.name,
					overview: episode.overview,
					imagePath: episode.media.imagePath,
					airDate: null,
					voteAverage: null,
				});
			}
			return episodes.sort((a, b) => a.number - b.number);
		}),

	getCredits: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(z.object({ id: ServerSeasonValidation.id }))
		.output(z.array(TmdbSerieCreditSchema))
		.query(async ({ input, ctx }) => {
			const season = await prisma.season.findFirst({
				where: { id: input.id, media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
				include: { media: true, serie: { include: { media: true } } },
			});
			if (!season) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			if (season.media.source !== SourceType.EXTERNAL) {
				return [];
			}
			const serieId = season.serie.media.externalId;
			if (!serieId) {
				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Season has no external series ID" });
			}
			const response = await useCache(`tmdb:serie:${serieId}:season:${season.number}:credits`, () =>
				tmdb(`/tv/${serieId}/season/${season.number}/credits`, { schema: TmdbSerieCreditsResponseSchema }),
			);
			return response.cast?.filter((credit) => !!credit) ?? [];
		}),

	update: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				id: ServerSeasonValidation.id,
				serieId: ServerSerieValidation.id.optional(),
				number: ServerSeasonValidation.number.optional(),
				name: ServerMediaValidation.name.optional(),
				overview: ServerSerieValidation.overview.nullable().optional(),
				status: ServerMediaValidation.status.nullable().optional(),
				rating: ServerMediaValidation.rating.nullable().optional(),
				note: ServerMediaValidation.note.nullable().optional(),
			}),
		)
		.output(SeasonSchema)
		.mutation(async ({ input, ctx }) => {
			const {
				id,
				serieId = Prisma.skip,
				number = Prisma.skip,
				name = Prisma.skip,
				overview = Prisma.skip,
				status = Prisma.skip,
				rating = Prisma.skip,
				note = Prisma.skip,
			} = input;
			return prisma.$transaction(async (tx) => {
				const season = await tx.season.findFirst({
					where: { id, media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
				});
				if (!season) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
				}
				const media = await tx.media.findUniqueOrThrow({ where: { id }, select: { source: true } });
				const changesSerie = serieId !== Prisma.skip && serieId !== season.serieId;
				const changesNumber = number !== Prisma.skip && number !== season.number;
				if (media.source === SourceType.EXTERNAL && (changesSerie || changesNumber)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "The series and number of an external season can not be changed",
					});
				}
				if (changesSerie) {
					await assertInternalSerie(tx, serieId as string, ctx.user.id);
				}
				try {
					return await tx.season.update({
						where: { id, media: { ownerId: ctx.user.id }, serie: { media: { ownerId: ctx.user.id } } },
						data: {
							overview,
							number,
							...(serieId === Prisma.skip ? {} : { serie: { connect: { id: serieId as string } } }),
							media: { update: { name, status, rating, note } },
						},
						include: { media: true },
					});
				} catch (error) {
					throw toSeasonConflict(error);
				}
			});
		}),

	createFromExternal: protectedProcedure
		.use(serieEnabledMiddleware)
		.input(
			z.object({
				externalSerieId: ServerTmdbSerieValidation.id,
				seasonNumber: ServerSeasonValidation.number,
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
		.input(z.object({ id: ServerSeasonValidation.id }))
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
