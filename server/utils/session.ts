import type { H3Event } from "h3";

export const isSecureRequest = (event: H3Event) => {
	if (serverEnv.COOKIE_SECURE !== undefined) {
		return serverEnv.COOKIE_SECURE;
	}

	// Trusting X-Forwarded-Proto is safe here: a spoofed header only affects the requester's own cookie.
	return getRequestProtocol(event, { xForwardedProto: true }) === "https";
};

export const setSessionCookie = (event: H3Event, sessionId: string) => {
	setCookie(event, "session_id", sessionId, {
		httpOnly: true,
		secure: isSecureRequest(event),
		sameSite: "strict",
		maxAge: DEFAULT_SESSION_EXPIRATION,
		path: "/",
	});
};
