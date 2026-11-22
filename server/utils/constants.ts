export const DEFAULT_CACHE_TTL = 60 * 60 * 1; // 1 hour
export const ADMIN_SETUP_TOKEN_TTL = 60 * 60 * 1; // 1 hour

export const ERROR_MESSAGES = {
	NOT_FOUND: "Resource not found",
	CONFLICT: "This resource already exists",
	BAD_REQUEST: "Invalid request",
} as const;
