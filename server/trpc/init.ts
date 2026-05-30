import { initTRPC, TRPCError } from "@trpc/server";

import { createContext } from "#server/trpc/context";

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create({
	isDev: false, // Remove the stacktrace from the http responses
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
	if (!ctx.jwtPayload) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			cause: "User is not authenticated",
			message: "You must login first before using this procedure",
		});
	}

	return next({ ctx: { ...ctx, jwtPayload: ctx.jwtPayload } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.jwtPayload.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			cause: "User is not authorized",
			message: "User doesn't have the right authorizations",
		});
	}

	return next({ ctx: { ...ctx, jwtPayload: ctx.jwtPayload } });
});
