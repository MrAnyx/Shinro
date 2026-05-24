import { addSeconds } from "date-fns";
import * as jwt from "jose";

export interface Payload {
	id: string;
	username: string;
}

const secret = new TextEncoder().encode(process.env.DATABASE_URL);

export const signJwt = (payload: Payload, duration: number) => {
	return new jwt.SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(addSeconds(new Date(), duration))
		.setSubject(payload.id)
		.sign(secret);
};

export const verifyJwt = async (token: string) => {
	const { payload } = await jwt.jwtVerify(token, secret, {
		algorithms: ["HS256"],
		clockTolerance: 0,
	});

	return payload;
};
