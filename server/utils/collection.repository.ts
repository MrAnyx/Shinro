import type { DbClient } from "./repository.types";

export const CollectionRepository = {
	/** Find a collection owned by the given user. */
	findOwned(db: DbClient, id: string, ownerId: string) {
		return db.collection.findFirst({
			where: { id, ownerId },
			select: { id: true, ownerId: true },
		});
	},

	countByOwner(db: DbClient, ownerId: string) {
		return db.collection.count({ where: { ownerId } });
	},
};
