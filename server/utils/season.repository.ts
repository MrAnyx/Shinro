import type { DbClient } from "./repository.types";

export const SeasonRepository = {
	/** Find a season owned by the given user, with the fields needed to guard mutations. */
	findOwned(db: DbClient, id: string, ownerId: string) {
		return db.season.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	findBySerieAndNumber(db: DbClient, serieId: string, number: number) {
		return db.season.findFirst({
			where: { serieId, number },
			select: { id: true },
		});
	},

	countByOwner(db: DbClient, ownerId: string) {
		return db.season.count({ where: { media: { ownerId } } });
	},
};
