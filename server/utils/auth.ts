import { randomBytes } from "crypto";

export const DEFAULT_SESSION_EXPIRATION = 60 * 60 * 24 * 10; // 10 days

export const generateSessionId = (length: number = 255): string => {
	// Hex encodes 4 bits per char, so we need (length * 4 / 8) bytes
	const byteLength = Math.ceil((length * 4) / 8);
	return randomBytes(byteLength).toString("hex").substring(0, length);
};
