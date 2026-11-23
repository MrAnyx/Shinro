export const DEFAULT_CACHE_TTL = 60 * 60 * 1; // 1 hour
export const ADMIN_SETUP_TOKEN_TTL = 60 * 60 * 1; // 1 hour

// Per-IP limits stay generous because, until SEC-04, clients behind a reverse proxy share the proxy IP
export const AUTH_RATE_LIMITS = {
	login: { limit: 5, windowSeconds: 60 * 15 },
	loginIp: { limit: 30, windowSeconds: 60 * 15 },
	register: { limit: 5, windowSeconds: 60 * 60 },
	verifyPassword: { limit: 5, windowSeconds: 60 * 15 },
} as const;

export const ERROR_MESSAGES = {
	NOT_FOUND: "Resource not found",
	CONFLICT: "This resource already exists",
	BAD_REQUEST: "Invalid request",
} as const;
