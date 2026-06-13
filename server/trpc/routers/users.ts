import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { addSeconds } from "date-fns";
import z from "zod";

import { router, publicProcedure, protectedProcedure } from "#server/trpc/init";

export const usersRouter = router({
	register: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.output(userRule)
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

			const sessionId = generateRandomString(255);

			await prisma.session.create({
				data: {
					expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
					sessionId: sessionId,
					userId: user.id,
				},
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: serverEnv.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});

			return user;
		}),

	login: publicProcedure
		.input(
			z.object({
				username: usernameRule,
				password: passwordRule,
			}),
		)
		.output(userRule)
		.mutation(async ({ input, ctx }) => {
			const user = await prisma.user.findUnique({
				where: {
					username: input.username,
				},
			});

			if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					cause: "Invalid username or password",
					message: "Your username or password are not valid",
				});
			}

			const sessionId = generateRandomString(255);

			await prisma.session.create({
				data: {
					expiresAt: addSeconds(new Date(), DEFAULT_SESSION_EXPIRATION),
					sessionId: sessionId,
					userId: user.id,
				},
			});

			setCookie(ctx.event, "session_id", sessionId, {
				httpOnly: true,
				secure: serverEnv.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: DEFAULT_SESSION_EXPIRATION,
				path: "/",
			});

			return {
				id: user.id,
				username: user.username,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				role: user.role,
			};
		}),
	logout: protectedProcedure
		.input(z.void())
		.output(z.void())
		.mutation(async ({ ctx }) => {
			await prisma.session.deleteMany({
				where: {
					sessionId: ctx.sessionId,
				},
			});

			deleteCookie(ctx.event, "session_id");
		}),
	me: protectedProcedure
		.input(z.void())
		.output(userRule)
		.query(async ({ ctx }) => {
			const user = await prisma.user.findUnique({
				where: {
					id: ctx.user.id,
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
