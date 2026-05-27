import { addSeconds } from "date-fns";
import * as jwt from "jose";

import type { JwtClaims } from "#server/types/jwt";

export const signJwt = (payload: JwtClaims, duration: number) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	return new jwt.SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(addSeconds(new Date(), duration))
		.setSubject(payload.id)
		.sign(secret);
};

export const verifyJwt = async (token: string) => {
	const { jwtSecret } = useRuntimeConfig();
	const secret = new TextEncoder().encode(jwtSecret);

	const { payload } = await jwt.jwtVerify(token, secret, {
		algorithms: ["HS256"],
		clockTolerance: 0,
	});

	return payload;
};
