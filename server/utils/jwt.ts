import * as jwt from "jose";

export interface Payload extends jwt.JWTPayload {
	id: string;
	username: string;
}

const secret = new TextEncoder().encode(process.env.DATABASE_URL);

export const signJwt = (payload: Payload) =>
	new jwt.SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("10m")
		.setSubject(payload.id)
		.sign(secret);

export const verifyJwt = async (token: string) => {
	const { payload } = await jwt.jwtVerify(token, secret, {
		algorithms: ["HS256"],
		clockTolerance: 0,
	});

	return payload as Payload;
};
