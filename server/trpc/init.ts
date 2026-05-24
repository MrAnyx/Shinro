import { initTRPC, TRPCError } from "@trpc/server";
import type { H3Event } from "h3";

export const createContext = (event: H3Event) => {
	const token = getCookie(event, "auth_token");
	const user = token ? { token } : undefined;
	return { event, user };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create({
	isDev: false, // Remove the stacktrace from the http responses
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			cause: "User is not authenticated",
			code: "UNAUTHORIZED",
			message: "You must login first before using this procedure",
		});
	}

	return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			cause: "User is not authorized",
			code: "FORBIDDEN",
			message: "User doesn't have the right authorizations",
		});
	}

	return next({ ctx: { ...ctx, user: ctx.user } });
});
