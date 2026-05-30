import { TRPCError } from "@trpc/server";
import type { H3Event } from "h3";
import * as jwt from "jose";

export const createContext = async (event: H3Event) => {
	const token = getCookie(event, "jwt_token");

	if (!token) {
		return { event };
	}

	try {
		const jwtPayload = await verifyJwt(token);
		return { event, jwtPayload };
	} catch (error) {
		if (error instanceof jwt.errors.JWTExpired) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				cause: "JWT token expired",
				message: "Please refresh your token or login again",
			});
		}
		if (error instanceof jwt.errors.JWSSignatureVerificationFailed) {
			throw new TRPCError({
				code: "FORBIDDEN",
				cause: "Invalid JWT token",
				message: "This token is invalid, please use a valid token",
			});
		}
		if (error instanceof jwt.errors.JWTClaimValidationFailed) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				cause: "Missing JWT claim",
				message: "This token is missing required claims",
			});
		}

		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			cause: "Can not verify the token",
			message: "This token can not be verified. Please try again later",
		});
	}
};
