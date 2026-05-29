import { addSeconds } from "date-fns";
import * as jwt from "jose";

import type { JwtClaims } from "#server/types/jwt";

const DEFAULT_ALGORITHM = "HS256";
const DEFAULT_CLOCK_TOLERANCE = 0;

export const signJwt = (payload: JwtClaims, duration: number) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	return new jwt.SignJWT({ ...payload })
		.setProtectedHeader({ alg: DEFAULT_ALGORITHM })
		.setIssuedAt()
		.setExpirationTime(addSeconds(new Date(), duration))
		.setSubject(payload.id)
		.sign(secret);
};

export const verifyJwt = async (token: string) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	const { payload } = await jwt.jwtVerify<JwtClaims>(token, secret, {
		algorithms: [DEFAULT_ALGORITHM],
		clockTolerance: DEFAULT_CLOCK_TOLERANCE,
	});
	return payload as JwtClaims;
};
