import { initTRPC, TRPCError } from "@trpc/server";
import { addSeconds } from "date-fns";
import superjson from "superjson";

import { createContext } from "#server/trpc/context";

type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create({
	isDev: serverEnv.NODE_ENV !== "production",
	transformer: superjson,
	errorFormatter({ shape, error }) {
		const originalError = error.cause;
		const timestamp = new Date().toISOString();

		// Override message for INTERNAL_SERVER_ERROR on production
		const message =
			error.code === "INTERNAL_SERVER_ERROR" && serverEnv.NODE_ENV === "production"
				? "Unexpected error"
				: error.message;

		return {
			...shape,
			message,
			data: {
				...shape.data,
				timestamp,
				// Conditionally include errorContext in development
				...(serverEnv.NODE_ENV !== "production" &&
					originalError instanceof Error && {
						message: originalError.message,
					}),
			},
		};
	},
});

export const { router } = trpc;

export const publicProcedure = trpc.procedure;

export const protectedProcedure = publicProcedure
	.use(async ({ ctx, next }) => {
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
				code: "UNAUTHORIZED",
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

		return next({ ctx: { ...ctx, sessionId, user: session.user } });
	})
	// Refresh session expiration
	.use(async ({ ctx, next }) => {
		await prisma.session.update({
			data: {
				expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
			},
			where: {
				sessionId: ctx.sessionId,
			},
		});

		return next();
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
