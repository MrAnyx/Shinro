import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { addSeconds } from "date-fns";
import z from "zod";

import { router, publicProcedure, protectedProcedure } from "#server/trpc/init";
import { DEFAULT_SESSION_EXPIRATION, generateSessionId } from "#server/utils/auth";

const { usernameRule, passwordRule } = useValidationRule();

export const usersRouter = router({
	register: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const totaluser = await prisma.user.count({ take: 1 });
			const isFirstUser = totaluser === 0;

			const userExist = await prisma.user.findUnique({
				where: {
					username: input.username,
				},
				select: {
					id: true,
				},
			});

			if (userExist) {
				throw new TRPCError({
					code: "CONFLICT",
					cause: "Username already used",
					message: "Choose a different username to create a new user",
				});
			}

			const password = await bcrypt.hash(input.password, 10);

			const user = await prisma.user.create({
				data: {
					passwordHash: password,
					username: input.username,
					role: isFirstUser ? "ADMIN" : "USER",
				},
			});

			const sessionId = generateSessionId(255);

			await prisma.session.create({
				data: {
					expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
					sessionId: sessionId,
					userId: user.id,
				},
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});
		}),

	login: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const user = await prisma.user.findUnique({
				where: {
					username: input.username,
				},
			});

			if (!user || (await bcrypt.compare(input.password, user.passwordHash))) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: "Invalid username or password",
					message: "Your username or password are not valid",
				});
			}

			const sessionId = generateSessionId(255);

			await prisma.session.create({
				data: {
					expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
					sessionId: sessionId,
					userId: user.id,
				},
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});
		}),
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		await prisma.session.deleteMany({
			where: {
				sessionId: ctx.sessionId,
			},
		});

		deleteCookie(ctx.event, "session_id");
	}),
	me: protectedProcedure.query(async ({ ctx }) => {
		const user = await prisma.user.findUnique({
			where: {
				id: ctx.user.id,
			},
			select: {
				id: true,
				username: true,
				createdAt: true,
				updatedAt: true,
				role: true,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				cause: "User not found",
				message: "The user doesn't exist",
			});
		}

		return user;
	}),
});
