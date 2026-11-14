import { randomBytes, timingSafeEqual } from "node:crypto";

import type { Prisma } from "#prisma/client";
import { Role } from "#prisma/enums";

const ADMIN_SETUP_STORAGE = "redis";
const ADMIN_SETUP_TOKEN_KEY = "admin-setup:token";

// Postgres advisory lock key that serializes concurrent admin claims
export const ADMIN_SETUP_LOCK_KEY = 0x5348_4e52;

interface StoredAdminSetupToken {
	tokenHash: string;
}

export const hasAdminUser = async (db: Prisma.TransactionClient = prisma) =>
	(await db.user.count({ where: { role: Role.ADMIN }, take: 1 })) > 0;

/**
 * Generate a one-time admin setup token, store only its hash with a TTL and return the plain token.
 * Any previously issued token is replaced.
 */
export const createAdminSetupToken = async () => {
	// Hex keeps the token easy to copy from logs and out of evlog's PII redaction patterns
	const token = randomBytes(32).toString("hex");

	await useStorage(ADMIN_SETUP_STORAGE).setItem<StoredAdminSetupToken>(
		ADMIN_SETUP_TOKEN_KEY,
		{ tokenHash: hashSessionToken(token) },
		{ ttl: ADMIN_SETUP_TOKEN_TTL },
	);

	return token;
};

export const isAdminSetupPending = async () => await useStorage(ADMIN_SETUP_STORAGE).hasItem(ADMIN_SETUP_TOKEN_KEY);

export const verifyAdminSetupToken = async (token: string) => {
	const stored = await useStorage(ADMIN_SETUP_STORAGE).getItem<StoredAdminSetupToken>(ADMIN_SETUP_TOKEN_KEY);

	if (!stored?.tokenHash) {
		return false;
	}

	const expected = Buffer.from(stored.tokenHash, "hex");
	const actual = Buffer.from(hashSessionToken(token), "hex");

	return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const deleteAdminSetupToken = async () =>
	await useStorage(ADMIN_SETUP_STORAGE).removeItem(ADMIN_SETUP_TOKEN_KEY);
