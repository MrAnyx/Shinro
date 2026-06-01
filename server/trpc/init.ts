import { initTRPC, TRPCError } from "@trpc/server";

import { createContext } from "#server/trpc/context";

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create({
	isDev: false, // Remove the stacktrace from the http responses
});

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
	const sessionId = getCookie(ctx.event, "session_id");

	if (!sessionId) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			cause: "User is not authenticated",
			message: "You must login first before using this procedure",
		});
	}

	const session = await prisma.session.findUnique({
		where: {
			sessionId: sessionId,
		},
		select: {
			expiresAt: true,
			user: {
				select: {
					id: true,
					role: true,
				},
			},
		},
	});

	if (!session || !session.user) {
		throw new TRPCError({
			code: "FORBIDDEN",
			cause: "Session doesn't exist or is invalid",
			message: "This session is invalid or doesn't exist",
		});
	}

	if (session.expiresAt < new Date()) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			cause: "Session expired",
			message: "This session has expired. You must login again",
		});
	}

	return next({ ctx: { ...ctx, user: session.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			cause: "User is not authorized",
			message: "User doesn't have the right authorizations",
		});
	}

	return next();
});
