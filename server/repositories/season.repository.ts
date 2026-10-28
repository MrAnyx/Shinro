import type { DbClient } from "./repository.types";

export const SeasonRepository = {
	/** Find a season owned by the given user, with the fields needed to guard mutations. */
	findOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		return db.season.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	findBySerieAndNumber({ serieId, number, db = prisma }: { serieId: string; number: number; db?: DbClient }) {
		return db.season.findFirst({
			where: { serieId, number },
			select: { id: true },
		});
	},

	countByOwner({ ownerId, db = prisma }: { ownerId: string; db?: DbClient }) {
		return db.season.count({ where: { media: { ownerId } } });
	},
};
