import { addSeconds } from "date-fns";
import * as jwt from "jose";

import type { JwtClaims } from "#server/types/jwt";

const DEFAULT_JWT_ALGORITHM = "HS256";
const DEFAULT_JWT_CLOCK_TOLERANCE = 0;
export const DEFAULT_JWT_TOKEN_EXPIRATION = 10 * 60; // 10 minutes
const DEFAULT_SESSION_EXPIRATION = 60 * 60 * 24 * 60; // 60 days

export const signJwt = (payload: JwtClaims) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	return new jwt.SignJWT({ ...payload })
		.setProtectedHeader({ alg: DEFAULT_JWT_ALGORITHM })
		.setIssuedAt()
		.setExpirationTime(addSeconds(new Date(), DEFAULT_JWT_TOKEN_EXPIRATION))
		.setSubject(payload.id)
		.sign(secret);
};

export const verifyJwt = async (token: string) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	const { payload } = await jwt.jwtVerify<JwtClaims>(token, secret, {
		algorithms: [DEFAULT_JWT_ALGORITHM],
		clockTolerance: DEFAULT_JWT_CLOCK_TOLERANCE,
	});
	return payload as JwtClaims;
};
