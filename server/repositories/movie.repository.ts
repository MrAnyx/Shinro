import type { DbClient } from "./repository";

export const MovieRepository = {
	/** Find a movie owned by the given user, with the fields needed to guard mutations. */
	findOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		return db.movie.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	/** Check if the user already added a movie from the given external source id. */
	findByExternalId({ externalId, ownerId, db = prisma }: { externalId: string; ownerId: string; db?: DbClient }) {
		return db.movie.findFirst({
			where: { media: { ownerId, externalId } },
			select: { id: true },
		});
	},

	countByOwner({ ownerId, db = prisma }: { ownerId: string; db?: DbClient }) {
		return db.movie.count({ where: { media: { ownerId } } });
	},
};
