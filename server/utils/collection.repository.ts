import type { DbClient } from "./repository.types";

export const CollectionRepository = {
	/** Find a collection owned by the given user. */
	findOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		return db.collection.findFirst({
			where: { id, ownerId },
			select: { id: true, ownerId: true },
		});
	},

	countByOwner({ ownerId, db = prisma }: { ownerId: string; db?: DbClient }) {
		return db.collection.count({ where: { ownerId } });
	},
};
