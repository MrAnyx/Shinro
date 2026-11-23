import { createHash } from "node:crypto";

import { hash as argon2Hash, verify as argon2Verify, type Options } from "@node-rs/argon2";

// Equivalent inputs (case, extra spaces) produce the same hash
export function normalizeAndHash(value: string): { normalized: string; hash: string } {
	const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
	const hash = createHash("sha256").update(normalized).digest("hex");

	return { normalized, hash };
}

// Argon2id (library default algorithm) with the OWASP baseline: 19 MiB, 2 passes, 1 lane
const PASSWORD_HASH_OPTIONS: Options = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
	return argon2Hash(password, PASSWORD_HASH_OPTIONS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	try {
		return await argon2Verify(passwordHash, password);
	} catch {
		// Malformed or non-argon2 hash (e.g. a legacy bcrypt hash)
		return false;
	}
}
