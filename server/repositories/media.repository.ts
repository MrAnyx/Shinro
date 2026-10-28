import type { DbClient } from "./repository.types";

export const MediaRepository = {
	/** Delete through the media model to leverage the cascade on delete feature. */
	deleteOwned({ id, ownerId, db = prisma }: { id: string; ownerId: string; db?: DbClient }) {
		return db.media.deleteMany({ where: { ownerId, id } });
	},
};
