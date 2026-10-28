import type { DbClient } from "./repository.types";

export const MovieRepository = {
	/** Find a movie owned by the given user, with the fields needed to guard mutations. */
	findOwned(db: DbClient, id: string, ownerId: string) {
		return db.movie.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	/** Check if the user already added a movie from the given external source id. */
	findByExternalId(db: DbClient, externalId: string, ownerId: string) {
		return db.movie.findFirst({
			where: { media: { ownerId, externalId } },
			select: { id: true },
		});
	},

	countByOwner(db: DbClient, ownerId: string) {
		return db.movie.count({ where: { media: { ownerId } } });
	},
};
