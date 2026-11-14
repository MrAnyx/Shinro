import { TRPCError } from "@trpc/server";

import type { Prisma } from "#prisma/client";

/**
 * Get the collections of a media. The media ownership must be checked by the caller.
 */
export const getMediaCollections = (ownerId: string, mediaId: string, db: Prisma.TransactionClient = prisma) =>
	db.collection.findMany({
		where: {
			ownerId,
			medias: { some: { mediaId } },
		},
	});

/**
 * Replace the collections of a media with the given ones and return them.
 * The media ownership must be checked by the caller. Pass the transaction client as `db` to run it with the media write.
 */
export const setMediaCollections = async (
	ownerId: string,
	mediaId: string,
	collectionIds: string[],
	db: Prisma.TransactionClient = prisma,
) => {
	const uniqueCollectionIds = [...new Set(collectionIds)];

	if (uniqueCollectionIds.length > 0) {
		const ownedCollectionsCount = await db.collection.count({
			where: {
				id: { in: uniqueCollectionIds },
				ownerId,
			},
		});

		if (ownedCollectionsCount !== uniqueCollectionIds.length) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "One or more selected collections are invalid",
			});
		}
	}

	await db.collectionMedia.deleteMany({ where: { mediaId } });

	if (uniqueCollectionIds.length > 0) {
		await db.collectionMedia.createMany({
			data: uniqueCollectionIds.map((collectionId) => ({ collectionId, mediaId })),
		});
	}

	return await getMediaCollections(ownerId, mediaId, db);
};
