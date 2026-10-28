import type { DbClient } from "./repository";

export const CollectionRepository = {
	/** Check whether a collection is owned by the given user. */
	async findOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		const collectionExist = await db.collection.findFirst({
			where: { id, ownerId },
		});

		return collectionExist !== null;
	},

	countByOwner({ ownerId, db = prisma }: { ownerId: string; db?: DbClient }) {
		return db.collection.count({ where: { ownerId } });
	},
};
