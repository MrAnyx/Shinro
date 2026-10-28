import type { DbClient } from "./repository.types";

export const MediaRepository = {
	/** Delete through the media model to leverage the cascade on delete feature. */
	deleteOwned(db: DbClient, id: string, ownerId: string) {
		return db.media.deleteMany({ where: { ownerId, id } });
	},
};
