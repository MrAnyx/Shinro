import { SignJWT } from "jose";

const config = useRuntimeConfig();

export const signJwt = async () =>
	new SignJWT({ sub: "test" })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("1d")
		.setIssuedAt()
		.sign(new TextEncoder().encode(config.jwtSecret));
