import { createHash } from "node:crypto";

// Equivalent inputs (case, extra spaces) produce the same hash
export function normalizeAndHash(value: string): { normalized: string; hash: string } {
	const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
	const hash = createHash("sha256").update(normalized).digest("hex");

	return { normalized, hash };
}
