import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { addSeconds } from "date-fns";
import z from "zod";
import { DEFAULT_SESSION_EXPIRATION, generateSessionId } from "~~/server/utils/auth";

import { router, publicProcedure, protectedProcedure } from "#server/trpc/init";

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
				select: {
					id: true,
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
				sameSite: "lax",
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

			if (!user) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: "Unknown username",
					message: "User doesn't exist",
				});
			}

			const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

			if (!isPasswordValid) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					cause: "Invalid password",
					message: "Invalid password",
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

			setCookie(ctx.event, "jwt_token", sessionId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});
		}),
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		deleteCookie(ctx.event, "jwt_token");
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
				code: "BAD_REQUEST",
				cause: "Unknown user id",
				message: "The user id is not valid",
			});
		}

		return user;
	}),
});
