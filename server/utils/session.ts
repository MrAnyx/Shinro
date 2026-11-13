import { createHash, randomBytes } from "node:crypto";

import { addSeconds } from "date-fns";
import type { H3Event } from "h3";

import type { Prisma } from "#prisma/client";

export const SESSION_COOKIE_NAME = "session_id";

export const generateSessionToken = () => randomBytes(32).toString("base64url");

// Only the SHA-256 hash of the token is stored, so a database leak doesn't expose usable session cookies.
export const hashSessionToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createSession = async (db: Prisma.TransactionClient, userId: string) => {
	const token = generateSessionToken();

	await db.session.create({
		data: {
			tokenHash: hashSessionToken(token),
			expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
			userId,
		},
	});

	return token;
};

export const isSecureRequest = (event: H3Event) => {
	if (serverEnv.COOKIE_SECURE !== undefined) {
		return serverEnv.COOKIE_SECURE;
	}

	// Trusting X-Forwarded-Proto is safe here: a spoofed header only affects the requester's own cookie.
	return getRequestProtocol(event, { xForwardedProto: true }) === "https";
};

export const getSessionCookie = (event: H3Event) => getCookie(event, SESSION_COOKIE_NAME);

export const deleteSessionCookie = (event: H3Event) => deleteCookie(event, SESSION_COOKIE_NAME, { path: "/" });

export const setSessionCookie = (event: H3Event, token: string) => {
	setCookie(event, SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		secure: isSecureRequest(event),
		sameSite: "strict",
		maxAge: DEFAULT_SESSION_EXPIRATION,
		path: "/",
	});
};
