import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma } from "#prisma/client";
import type { CollectionMediaCreateManyInput } from "#prisma/models";
import { router, protectedProcedure } from "#server/trpc/init";

export default router({
	create: protectedProcedure
		.input(
			z.object({
				name: ServerMediaValidation.name,
				overview: ServerSerieValidation.overview,
				status: ServerMediaValidation.status,
				rating: ServerMediaValidation.rating,
				note: ServerMediaValidation.note,
			}),
		)
		.output(SerieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			return await prisma.serie.create({
				data: {
					media: {
						create: {
							name: input.name,
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
				externalId: ServerTmdbSerieValidation.id,
			}),
		)
		.output(SerieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const serieExist = await prisma.serie.findFirst({
				where: {
					media: {
						ownerId: ctx.user.id,
						externalId: input.externalId,
					},
				},
				select: {
					id: true,
				},
			});

			if (serieExist) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "This serie as already been added",
				});
			}

			const tmdbSerie = await tmdb(`/tv/${input.externalId}`, {
				schema: TmdbSerieDetailsResponseSchema,
			});

			const serie = await prisma.serie.create({
				data: {
					media: {
						create: {
							externalId: tmdbSerie.id,
							name: tmdbSerie.name ?? null,
							type: MediaType.SERIE,
							ownerId: ctx.user.id,
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

			return serie;
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
		.output(SerieWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const existingSerie = await prisma.serie.findFirst({
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

			return await prisma.serie.update({
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
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: ServerSerieValidation.id,
			}),
		)
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			const existingSerie = await prisma.serie.findFirst({
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

			if (!existingSerie) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Serie not found",
				});
			}
			// Use the media model to leverage the cascade on delete feature
			await prisma.media.deleteMany({
				where: {
					ownerId: ctx.user.id,
					id: input.id,
				},
			});
		}),

	count: protectedProcedure
		.input(z.void())
		.output(z.number())
		.query(async ({ ctx }) => {
			return await prisma.serie.count({
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
				orderBy: SortableSchema(ServerSerieValidation.sort),
			}),
		)
		.output(PaginatedSchema(SerieWithMediaViewSchema))
		.query(async ({ input, ctx }) => {
			const skip = (input.page - 1) * ITEMS_PER_PAGE;
			const orderBy = buildPrismaOrderBy<Prisma.SerieOrderByWithRelationInput>(input.orderBy);

			const where: Prisma.SerieWhereInput = {
				media: {
					ownerId: ctx.user.id,
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
			z.object({
				id: ServerSerieValidation.id.optional(),
				externalId: ServerTmdbSerieValidation.id.optional(),
			}),
		)
		.output(SerieWithMediaViewSchema)
		.query(async ({ input, ctx }) => {
			if (!input.id && !input.externalId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Either id or externalId must be specified",
				});
			}

			const mediaFilter: Prisma.MediaWhereInput = input.id ? { id: input.id } : { externalId: input.externalId };

			const serie = await prisma.serie.findFirst({
				where: {
					media: {
						...mediaFilter,
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
