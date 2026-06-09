import { randomBytes } from "node:crypto";

export const generateSessionId = (length: number): string => {
	// Hex encodes 4 bits per char, so we need (length * 4 / 8) bytes
	const byteLength = Math.ceil((length * 4) / 8);
	return randomBytes(byteLength).toString("hex").substring(0, length);
};
