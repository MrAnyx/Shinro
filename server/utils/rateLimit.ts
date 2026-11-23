import type { H3Event } from "h3";

// In-memory: limits reset on restart and aren't shared between replicas, which suits a single self-hosted instance
const attempts = new Map<string, { hits: number[]; expiresAt: number }>();

// Drop idle entries so clients that never come back don't accumulate
setInterval(() => {
	const now = Date.now();

	for (const [key, entry] of attempts) {
		if (entry.expiresAt <= now) {
			attempts.delete(key);
		}
	}
}, 60_000).unref();

// TODO(SEC-04): honour X-Forwarded-For when the instance runs behind a trusted proxy
export const getClientIP = (event: H3Event) => getRequestIP(event) ?? "unknown";

export const consumeRateLimit = (key: string, { limit, windowSeconds }: { limit: number; windowSeconds: number }) => {
	const now = Date.now();
	const windowMs = windowSeconds * 1000;
	const hits = attempts.get(key)?.hits.filter((time) => time > now - windowMs) ?? [];

	if (hits.length >= limit) {
		return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((hits[0]! + windowMs - now) / 1000)) };
	}

	hits.push(now);
	attempts.set(key, { hits, expiresAt: now + windowMs });

	return { allowed: true, retryAfterSeconds: 0 };
};
