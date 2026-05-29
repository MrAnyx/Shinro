import { initTRPC, TRPCError } from "@trpc/server";
import type { H3Event } from "h3";
import * as jwt from "jose";

export const createContext = async (event: H3Event) => {
	const token = getCookie(event, "auth_token");

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

		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			cause: "Can not verify the token",
			message: "This token can not be verified. Please try again later",
		});
	}
};

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create({
	isDev: false, // Remove the stacktrace from the http responses
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
	if (!ctx.jwtPayload) {
		throw new TRPCError({
			cause: "User is not authenticated",
			code: "UNAUTHORIZED",
			message: "You must login first before using this procedure",
		});
	}

	return next({ ctx: { ...ctx, jwtPayload: ctx.jwtPayload } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.jwtPayload.role !== "ADMIN") {
		throw new TRPCError({
			cause: "User is not authorized",
			code: "FORBIDDEN",
			message: "User doesn't have the right authorizations",
		});
	}

	return next({ ctx: { ...ctx, jwtPayload: ctx.jwtPayload } });
});
