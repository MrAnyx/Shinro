import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ImageType, MediaType, Prisma } from "#prisma/client";
import { router, protectedProcedure } from "#server/trpc/init";

const seasonInput = z.object({
	serieId: ServerSerieValidation.id,
	number: ServerSeasonValidation.number,
	externalId: ServerMediaValidation.externalId.optional(),
	name: ServerMediaValidation.name.nullable().optional(),
	imagePath: z.string().max(500).nullable().optional(),
	overview: ServerSeasonValidation.overview,
	status: ServerMediaValidation.status,
	rating: ServerMediaValidation.rating,
	note: ServerMediaValidation.note,
});

const getOwnedSeason = (id: string, ownerId: string) =>
	prisma.season.findFirst({
		where: { id, media: { ownerId } },
		include: { media: true },
	});

export default router({
	createFromExternal: protectedProcedure
		.input(seasonInput.extend({ externalId: ServerMediaValidation.externalId }))
		.output(SeasonWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const serie = await prisma.serie.findFirst({
				where: { id: input.serieId, media: { ownerId: ctx.user.id } },
				select: { id: true },
			});

			if (!serie) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Serie not found" });
			}

			const existingSeason = await prisma.season.findFirst({
				where: { serieId: input.serieId, number: input.number, media: { ownerId: ctx.user.id } },
				select: { id: true },
			});

			if (existingSeason) {
				throw new TRPCError({ code: "CONFLICT", message: "This season has already been added" });
			}

			return prisma.season.create({
				data: {
					number: input.number,
					overview: input.overview,
					serie: { connect: { id: input.serieId } },
					media: {
						create: {
							externalId: input.externalId,
							name: input.name,
							imagePath: input.imagePath,
							type: MediaType.SEASON,
							imageType: ImageType.TMDB,
							ownerId: ctx.user.id,
						},
					},
				},
				include: { media: true },
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: ServerSeasonValidation.id,
				number: ServerSeasonValidation.number.optional(),
				name: ServerMediaValidation.name.nullable().optional(),
				overview: ServerSeasonValidation.overview.optional(),
				status: ServerMediaValidation.status.optional(),
				rating: ServerMediaValidation.rating.optional(),
				note: ServerMediaValidation.note.optional(),
			}),
		)
		.output(SeasonWithMediaViewSchema)
		.mutation(async ({ input, ctx }) => {
			const existingSeason = await getOwnedSeason(input.id, ctx.user.id);
			if (!existingSeason) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}

			const {
				id,
				number = Prisma.skip,
				overview = Prisma.skip,
				name = Prisma.skip,
				status = Prisma.skip,
				rating = Prisma.skip,
				note = Prisma.skip,
			} = input;
			return prisma.season.update({
				where: { id },
				data: {
					number,
					overview,
					media: { update: { name, status, rating, note } },
				},
				include: { media: true },
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: ServerSeasonValidation.id }))
		.output(z.void())
		.mutation(async ({ input, ctx }) => {
			if (!(await getOwnedSeason(input.id, ctx.user.id))) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			await prisma.media.delete({ where: { id: input.id, ownerId: ctx.user.id } });
		}),

	getById: protectedProcedure
		.input(z.object({ id: ServerSeasonValidation.id }))
		.output(SeasonWithMediaViewSchema)
		.query(async ({ input, ctx }) => {
			const season = await getOwnedSeason(input.id, ctx.user.id);
			if (!season) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });
			}
			return season;
		}),

	getBySerie: protectedProcedure
		.input(z.object({ serieId: ServerSerieValidation.id }))
		.output(z.array(SeasonWithMediaViewSchema))
		.query(async ({ input, ctx }) => {
			return prisma.season.findMany({
				where: { serieId: input.serieId, media: { ownerId: ctx.user.id } },
				orderBy: { number: "asc" },
				include: { media: true },
			});
		}),

	getBySerieExternalId: protectedProcedure
		.input(
			z.object({
				serieExternalId: ServerTmdbSerieValidation.id,
				number: ServerSeasonValidation.number,
			}),
		)
		.output(SeasonWithMediaViewSchema.nullable())
		.query(async ({ input, ctx }) =>
			prisma.season.findFirst({
				where: {
					number: input.number,
					serie: { media: { externalId: input.serieExternalId } },
					media: { ownerId: ctx.user.id },
				},
				include: { media: true },
			}),
		),
});
