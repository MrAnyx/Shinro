import type { DbClient } from "./repository.types";

export const SerieRepository = {
	/** Find a serie owned by the given user, with the fields needed to guard mutations. */
	findOwned(db: DbClient, id: string, ownerId: string) {
		return db.serie.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	/** Check if the user already added a serie from the given external source id. */
	findByExternalId(db: DbClient, externalId: string, ownerId: string) {
		return db.serie.findFirst({
			where: { media: { ownerId, externalId } },
			select: { id: true },
		});
	},

	countByOwner(db: DbClient, ownerId: string) {
		return db.serie.count({ where: { media: { ownerId } } });
	},
};
