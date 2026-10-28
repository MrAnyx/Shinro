import type { DbClient } from "./repository.types";

export const SerieRepository = {
	/** Find a serie owned by the given user, with the fields needed to guard mutations. */
	findOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		return db.serie.findFirst({
			where: { id, media: { ownerId } },
			select: { id: true, media: { select: { ownerId: true, source: true } } },
		});
	},

	/** Check if the user already added a serie from the given external source id. */
	findByExternalId({ externalId, ownerId, db = prisma }: { externalId: string; ownerId: string; db?: DbClient }) {
		return db.serie.findFirst({
			where: { media: { ownerId, externalId } },
			select: { id: true },
		});
	},

	countByOwner({ ownerId, db = prisma }: { ownerId: string; db?: DbClient }) {
		return db.serie.count({ where: { media: { ownerId } } });
	},
};
